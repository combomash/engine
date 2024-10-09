const fpsBuffer: number[] = [];
const bufferSize = 60;

function calculateFPS(deltaTime: number) {
    fpsBuffer.push(deltaTime);
    if (fpsBuffer.length > bufferSize) {
        fpsBuffer.shift();
    }
    const averageDeltaTime = fpsBuffer.reduce((sum, dt) => sum + dt, 0) / fpsBuffer.length;
    return 1 / averageDeltaTime;
}

export {calculateFPS};
