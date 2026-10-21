const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ffmpeg = 'C:\\Users\\Lenovo\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe';
const outDir = path.join(__dirname, 'assets', 'previews');

const presets = [
  {
    id: 'portrait_smile',
    filter: "color=c=#1c1214:s=480x270:d=4,drawbox=x=160:y=35:w=160:h=200:color=#d98b6c@0.55:t=fill,drawbox=x=185:y=60:w=110:h=120:color=#f5be9e@0.85:t=fill,drawbox=x=205:y=100:w=25:h=12:color=#222222:t=fill,drawbox=x=250:y=100:w=25:h=12:color=#222222:t=fill,drawbox=x=218:y=145:w=44:h=14:color=#9e2a2b:t=fill,zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=480x270:fps=30"
  },
  {
    id: 'golden_hour',
    filter: "color=c=#331702:s=480x270:d=4,drawbox=x=150:y=40:w=180:h=190:color=#ff9800@0.65:t=fill,drawbox=x=175:y=65:w=130:h=130:color=#ffca28@0.9:t=fill,drawbox=x=200:y=105:w=25:h=10:color=#3e2723:t=fill,drawbox=x=255:y=105:w=25:h=10:color=#3e2723:t=fill,drawbox=x=215:y=145:w=50:h=12:color=#c2185b:t=fill,zoompan=z='min(zoom+0.001,1.12)':x='iw/2-(iw/zoom/2)+sin(in/12)*25':y='ih/2-(ih/zoom/2)':d=120:s=480x270:fps=30"
  },
  {
    id: 'cyberpunk_neon',
    filter: "color=c=#070817:s=480x270:d=4,drawbox=x=160:y=40:w=160:h=190:color=#00e5ff@0.5:t=fill,drawbox=x=185:y=65:w=110:h=120:color=#ff007f@0.7:t=fill,drawbox=x=205:y=100:w=25:h=10:color=#00f0ff:t=fill,drawbox=x=250:y=100:w=25:h=10:color=#00f0ff:t=fill,drawbox=x=220:y=140:w=40:h=8:color=#ffffff:t=fill,hue='H=2*PI*t:s=1.2',zoompan=z='min(zoom+0.0012,1.1)':d=120:s=480x270:fps=30"
  },
  {
    id: 'action_turn',
    // Fast whip-pan achieved via zoompan movement
    filter: "color=c=#101820:s=480x270:d=4,drawbox=x=160:y=40:w=160:h=190:color=#00c853@0.45:t=fill,drawbox=x=185:y=65:w=110:h=120:color=#ffb74d@0.85:t=fill,drawbox=x=205:y=100:w=25:h=10:color=#212121:t=fill,drawbox=x=250:y=100:w=25:h=10:color=#212121:t=fill,zoompan=z='min(zoom+0.002,1.2)':x='iw/2-(iw/zoom/2)+sin(in/10)*40':y='ih/2-(ih/zoom/2)':d=120:s=480x270:fps=30"
  },
  {
    id: 'nature_wind',
    // Swaying motion via zoompan coordinates
    filter: "color=c=#091f14:s=480x270:d=4,drawbox=x=160:y=40:w=160:h=190:color=#2e7d32@0.5:t=fill,drawbox=x=185:y=65:w=110:h=120:color=#a5d6a7@0.8:t=fill,drawbox=x=205:y=100:w=25:h=10:color=#1b5e20:t=fill,drawbox=x=250:y=100:w=25:h=10:color=#1b5e20:t=fill,zoompan=z='min(zoom+0.001,1.1)':x='iw/2-(iw/zoom/2)+sin(in/8)*20':y='ih/2-(ih/zoom/2)+cos(in/8)*10':d=120:s=480x270:fps=30"
  }
];

for (const p of presets) {
  const mp4Path = path.join(outDir, `${p.id}.mp4`);
  const posterPath = path.join(outDir, `${p.id}.jpg`);

  console.log(`Generating preview for ${p.id}...`);

  const res = spawnSync(ffmpeg, [
    '-y',
    '-lavfi', p.filter,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '28',
    '-preset', 'veryfast',
    '-an',
    '-movflags', '+faststart',
    '-t', '4',
    mp4Path
  ]);

  if (res.status !== 0) {
    console.error(`Error on ${p.id}:`, res.stderr ? res.stderr.toString() : 'unknown');
  } else {
    spawnSync(ffmpeg, [
      '-y',
      '-ss', '00:00:01',
      '-i', mp4Path,
      '-vframes', '1',
      '-q:v', '3',
      posterPath
    ]);

    const stat = fs.statSync(mp4Path);
    console.log(`✓ ${p.id}.mp4: ${(stat.size / 1024).toFixed(1)} KB`);
  }
}
