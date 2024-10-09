export function logSampleProgress(sample: number, samples: number) {
    let numDigits = `${samples}`.length;
    let samplePadded = sample.toString().padStart(numDigits, ' ');
    let percentDone = Math.floor(((sample - 1) / samples) * 100);
    console.log(`Render > Sample: ${samplePadded} / ${samples} - ${percentDone}%`);
}
