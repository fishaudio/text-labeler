import colormap from "colormap";

// Define utility functions for rendering the spectrogram
const arrayMinMax = (arr: number[]): [number, number] =>
  arr.reduce(
    ([min, max], val) => [Math.min(min, val), Math.max(max, val)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  );

const viridis = colormap({
  colormap: "viridis",
  nshades: 256,
  format: "rgba",
  alpha: 1,
});

const matrixToColor = (matrix: number[][]): number[][][] => {
  const [minValue, maxValue] = arrayMinMax(matrix.flat());
  const numRows = matrix.length;
  const numCols = matrix[0].length;

  const colorMatrix = new Array(numRows);
  for (let i = 0; i < numRows; i++) {
    colorMatrix[i] = new Array(numCols);
    for (let j = 0; j < numCols; j++) {
      const normalizedValue = (matrix[i][j] - minValue) / (maxValue - minValue);
      const index = Math.round(normalizedValue * (viridis.length - 1));
      colorMatrix[i][j] = viridis[index];
    }
  }

  return colorMatrix;
};

const hzToMel = (frequency: number): number => {
  const f_min = 0.0;
  const f_sp = 200.0 / 3;
  const min_log_hz = 1000.0;
  const min_log_mel = (min_log_hz - f_min) / f_sp;
  const logstep = Math.log(6.4) / 27.0;

  let mel = (frequency - f_min) / f_sp;

  if (frequency >= min_log_hz) {
    mel = min_log_mel + Math.log(frequency / min_log_hz) / logstep;
  }

  return mel;
};

const melToHz = (mel: number): number => {
  const f_min = 0.0;
  const f_sp = 200.0 / 3;
  const min_log_hz = 1000.0;
  const min_log_mel = (min_log_hz - f_min) / f_sp;
  const logstep = Math.log(6.4) / 27.0;

  let frequency = f_min + f_sp * mel;

  if (mel >= min_log_mel) {
    frequency = min_log_hz * Math.exp(logstep * (mel - min_log_mel));
  }

  return frequency;
};

const fToMel = (
  f: number,
  fMin: number = 40,
  fMax: number = 16000,
  nMels: number = 128
): number => {
  const melMin = hzToMel(fMin);
  const melMax = hzToMel(fMax);

  return ((hzToMel(f) - melMin) / (melMax - melMin)) * nMels;
};

export const melToF = (
  mel: number,
  fMin: number = 40,
  fMax: number = 16000,
  nMels: number = 128
): number => {
  const melMin = hzToMel(fMin);
  const melMax = hzToMel(fMax);

  return melToHz(melMin + (mel / nMels) * (melMax - melMin));
};

const melFreqs = (
  fMin: number = 40,
  fMax: number = 16000,
  nMels: number = 128
): number[] => {
  const melMin = hzToMel(fMin);
  const melMax = hzToMel(fMax);
  const mel_step = (melMax - melMin) / (nMels - 1);

  const freqs = new Array(nMels);
  for (let i = 0; i < nMels; i++) {
    freqs[i] = melToHz(melMin + i * mel_step);
  }

  return freqs;
};

export const drawMel = (canvas: HTMLCanvasElement, mel: number[][]): void => {
  const ctx = canvas.getContext("2d");
  const colorMatrix = matrixToColor(mel);
  colorMatrix.reverse(); // Since it's a mel spectrogram, we need to vertically flip the matrix

  const numRows = colorMatrix.length;
  const numCols = colorMatrix[0].length;
  const cellWidth = canvas.width / numCols;
  const cellHeight = canvas.height / numRows;

  const imageData = ctx!.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const color = colorMatrix[i][j];
      const x = Math.floor(j * cellWidth);
      const y = Math.floor(i * cellHeight);

      for (let dx = 0; dx < cellWidth; dx++) {
        for (let dy = 0; dy < cellHeight; dy++) {
          const dataIndex = 4 * ((y + dy) * canvas.width + (x + dx));
          data[dataIndex] = color[0];
          data[dataIndex + 1] = color[1];
          data[dataIndex + 2] = color[2];
          data[dataIndex + 3] = 255; // Alpha channel (255 = opaque)
        }
      }
    }
  }

  ctx!.putImageData(imageData, 0, 0);
};

export const drawPitches = (
  canvas: HTMLCanvasElement,
  pitches: number[]
): void => {
  const ctx = canvas.getContext("2d");
  const cellWidth = canvas.width / pitches.length;
  const cellHeight = canvas.height / 128;

  ctx!.beginPath();
  ctx!.lineWidth = 2;
  ctx!.strokeStyle = "red";

  pitches.forEach((pitch, index) => {
    const x = index * cellWidth;
    const y = canvas.height - fToMel(pitch) * cellHeight;

    if (index === 0) {
      ctx!.moveTo(x, y);
    } else {
      ctx!.lineTo(x, y);
    }
  });

  ctx!.stroke();
};
