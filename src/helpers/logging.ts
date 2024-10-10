function formatElapsedTime(elapsedTime: number) {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0')].join(':');
}

export function logSampleProgress(sample: number, samples: number, elapsedTime: number) {
    let numDigits = `${samples}`.length;
    let samplePadded = sample.toString().padStart(numDigits, ' ');
    let percentDone = Math.floor(((sample - 1) / samples) * 100);
    let timeSoFar = formatElapsedTime(elapsedTime);
    console.log(`Render > Sample: ${sample} / ${samples} | ${timeSoFar} | ${percentDone}%`);
}

export function logFrameFPS(frame: number, fps: number) {
    console.log(`FPS: ${fps}, Frame: ${frame}`);
}

export function logRenderTime(label: string, elapsedTime: number) {
    const formattedTime = formatElapsedTime(elapsedTime);
    console.log(`${label}${formattedTime}`);
}
