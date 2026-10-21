import os
import sys
import io
import time
import math
import base64
import torch
import torchvision.transforms.functional as TF
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="VideomakerIA Local GPU Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Detect Hardware
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
GPU_NAME = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
VRAM_GB = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2) if torch.cuda.is_available() else 0.0

print(f"[VideomakerIA Engine] Initialized on {DEVICE} ({GPU_NAME}) - VRAM: {VRAM_GB} GB")

class GenerateRequest(BaseModel):
    image_base64: str
    prompt: str
    model: str = "local_gpu"
    num_frames: int = 90  # 3 seconds @ 30 fps
    fps: int = 30

@app.get("/health")
def health():
    return {
        "status": "online",
        "device": str(DEVICE),
        "gpu_name": GPU_NAME,
        "vram_gb": VRAM_GB,
        "cuda_available": torch.cuda.is_available()
    }

def parse_prompt_dynamics(prompt: str):
    p = prompt.lower()
    dynamics = {
        "zoom": 0.002,
        "pan_x": 0.0,
        "pan_y": 0.0,
        "orbital": False,
        "wind": False,
        "golden_hour": False,
        "neon": False,
        "slow_mo": False
    }

    if "zoom in" in p or "dolly-in" in p or "aproximando" in p or "dolly" in p:
        dynamics["zoom"] = 0.003
    elif "zoom out" in p or "afastando" in p:
        dynamics["zoom"] = -0.002
    
    if "giro" in p or "orbital" in p or "360" in p or "ao redor" in p:
        dynamics["orbital"] = True
    
    if "vento" in p or "wind" in p or "cabelo" in p:
        dynamics["wind"] = True
        
    if "pôr do sol" in p or "golden hour" in p or "dourada" in p:
        dynamics["golden_hour"] = True
        
    if "neon" in p or "cyberpunk" in p:
        dynamics["neon"] = True

    if "chicote" in p or "whip pan" in p or "virada" in p:
        dynamics["pan_x"] = 0.005

    return dynamics

@app.post("/generate")
def generate_video(req: GenerateRequest):
    try:
        t0 = time.time()
        # 1. Decode user photo
        raw_b64 = req.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        
        img_bytes = base64.b64decode(raw_b64)
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # Standardize size for fast GPU tensor inference
        target_w, target_h = 720, 720
        pil_img = pil_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Convert to PyTorch Tensor on GPU
        img_tensor = TF.to_tensor(pil_img).unsqueeze(0).to(DEVICE) # [1, 3, H, W]
        
        dynamics = parse_prompt_dynamics(req.prompt)
        num_frames = req.num_frames
        fps = req.fps
        
        # Prepare output directory
        out_dir = os.path.join(os.getcwd(), "outputs")
        os.makedirs(out_dir, exist_ok=True)
        video_filename = f"gen_{int(time.time())}.mp4"
        video_path = os.path.join(out_dir, video_filename)
        
        # Initialize video writer with OpenCV
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(video_path, fourcc, fps, (target_w, target_h))
        
        # Generate frames with PyTorch GPU acceleration
        with torch.no_grad():
            for i in range(num_frames):
                t_norm = i / float(num_frames)
                
                # Camera scale & trajectory
                current_zoom = 1.0 + (dynamics["zoom"] * i)
                
                # Orbital / sway displacement
                if dynamics["orbital"]:
                    dx = math.sin(t_norm * 2 * math.pi) * 18.0
                    dy = math.cos(t_norm * 2 * math.pi) * 6.0
                elif dynamics["wind"]:
                    dx = math.sin(t_norm * 4 * math.pi) * 8.0 + math.sin(t_norm * 10 * math.pi) * 3.0
                    dy = math.cos(t_norm * 3 * math.pi) * 4.0
                elif dynamics["pan_x"] != 0:
                    dx = math.sin(t_norm * math.pi) * 40.0
                    dy = 0.0
                else:
                    # Subtle breathing/alive motion
                    dx = math.sin(t_norm * 2 * math.pi) * 4.0
                    dy = math.sin(t_norm * 4 * math.pi) * 2.0
                
                # GPU Tensor Affine Transformation
                # [angle, translate, scale, shear]
                frame_tensor = TF.affine(
                    img_tensor,
                    angle=math.sin(t_norm * 2 * math.pi) * 0.8 if dynamics["wind"] else 0.0,
                    translate=[int(dx), int(dy)],
                    scale=current_zoom,
                    shear=[0.0, 0.0]
                )
                
                # Dynamic lighting filter (Golden Hour or Neon shift)
                if dynamics["golden_hour"]:
                    # Warm highlight pulse
                    warm_factor = 1.0 + 0.12 * math.sin(t_norm * math.pi)
                    frame_tensor[:, 0, :, :] = torch.clamp(frame_tensor[:, 0, :, :] * warm_factor, 0.0, 1.0)
                    frame_tensor[:, 1, :, :] = torch.clamp(frame_tensor[:, 1, :, :] * (1.0 + 0.06 * math.sin(t_norm * math.pi)), 0.0, 1.0)
                elif dynamics["neon"]:
                    neon_pulse = 0.15 * math.sin(t_norm * 2 * math.pi)
                    frame_tensor[:, 2, :, :] = torch.clamp(frame_tensor[:, 2, :, :] * (1.0 + neon_pulse), 0.0, 1.0)
                    frame_tensor[:, 0, :, :] = torch.clamp(frame_tensor[:, 0, :, :] * (1.0 - neon_pulse * 0.5), 0.0, 1.0)
                
                # Convert back from GPU tensor to BGR for OpenCV
                frame_np = frame_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
                frame_np = (frame_np * 255.0).astype(np.uint8)
                frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
                
                writer.write(frame_bgr)
                
        writer.release()
        
        # Convert MP4 to H.264 web standard via ffmpeg
        ffmpeg_bin = r"C:\Users\Lenovo\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
        web_mp4_path = os.path.join(out_dir, f"web_{video_filename}")
        
        if os.path.exists(ffmpeg_bin):
            ffmpeg_cmd = f'"{ffmpeg_bin}" -y -i "{video_path}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "{web_mp4_path}"'
            os.system(ffmpeg_cmd)
        
        final_path = web_mp4_path if os.path.exists(web_mp4_path) and os.path.getsize(web_mp4_path) > 0 else video_path
        
        with open(final_path, "rb") as f:
            b64_out = base64.b64encode(f.read()).decode("utf-8")
        
        elapsed = round(time.time() - t0, 2)
        print(f"[VideomakerIA Engine] Video created in {elapsed}s on {GPU_NAME}")
        
        return {
            "status": "success",
            "device": GPU_NAME,
            "elapsed_seconds": elapsed,
            "video_base64": f"data:video/mp4;base64,{b64_out}"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Serve static frontend files directly from the same port (8000)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
