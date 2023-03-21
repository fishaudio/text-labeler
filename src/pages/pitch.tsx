import Head from "next/head";
import Grid from "@mui/material/Unstable_Grid2";
import { Container, IconButton, Paper, styled } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useCallback, useEffect, useRef, useState } from "react";
import data from "./data.json";
import { drawMel, drawPitches, melToF } from "@/components/MelSpec";

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  ...theme.typography.h5,
  textAlign: "center",
  alignContent: "center",
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
}));

export default function PitchEditor() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"select" | "draw">("draw");
  const [mouseDown, setMouseDown] = useState(false);
  const [scale, setScale] = useState(1);
  const [mel, setMel] = useState<number[][]>((data as any).mel);
  const [pitches, setPitches] = useState<{ [key: string]: number[] }>(
    (data as any).pitches
  );
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const melCanvas = useRef<HTMLCanvasElement>(null);

  const openRepo = () => {
    window.open("https://github.com/fishaudio/text-labeler", "_blank");
  };

  useEffect(() => {
    if (!melCanvas.current) return;

    const start = performance.now();
    drawMel(melCanvas.current, mel);
    console.log(`Drawn mel in ${performance.now() - start}ms`);
  }, [melCanvas, mel, scale]);

  useEffect(() => {
    if (!canvas.current || !melCanvas.current) return;

    const start = performance.now();
    // Draw the mel canvas
    canvas.current
      .getContext("2d")
      ?.drawImage(
        melCanvas.current,
        0,
        0,
        canvas.current.width,
        canvas.current.height
      );
    drawPitches(canvas.current, pitches["final"]);
    console.log(`Drawn pitches in ${performance.now() - start}ms`);
  }, [canvas, melCanvas, pitches, scale]);

  const updatePitches = useCallback(
    (x: number, y: number) => {
      if (!canvas.current) return;

      // Calculate the index of the pitch in the array based on the X position
      const index = Math.floor(x / scale);
      if (!prevIndex || index === prevIndex) {
        setPrevIndex(index);
        return;
      }

      console.info(
        `Updating pitch at index ${index}, pitch value ${y}, prevIndex ${prevIndex}`
      );

      // Calculate the pitch value based on the Y position (invert the Y axis)
      const heightToMel = canvas.current.height / 128;
      const pitchValue = melToF((canvas.current.height - y) / heightToMel);

      // Update the pitch value at the given index
      setPitches((prevPitches) => {
        const updatedPitches = { ...prevPitches };
        for (let i = prevIndex; i <= index; i++) {
          updatedPitches["final"][i] = pitchValue;
        }
        return updatedPitches;
      });

      setPrevIndex(index);
    },
    [scale, canvas, prevIndex]
  );

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvas.current || !mouseDown) return;

    updatePitches(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  return (
    <>
      <Head>
        <title>Fish Audio Labeler</title>
        <meta name="description" content="Fish Audio Labeler" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Header>
                Fish Audio Labeler
                <IconButton sx={{ color: "#000" }} onClick={openRepo}>
                  <GitHubIcon />
                </IconButton>
              </Header>
            </Grid>
            <Grid xs={12} md={12}>
              <div>
                <button onClick={() => setScale((prevScale) => prevScale * 2)}>
                  Zoom In
                </button>
                <button onClick={() => setScale((prevScale) => prevScale / 2)}>
                  Zoom Out
                </button>
                {/* Selection */}
                <button
                  onClick={() => {
                    setMode("select");
                  }}
                  disabled={mode === "select"}
                >
                  Select
                </button>
                {/* Drawing */}
                <button
                  onClick={() => {
                    setMode("draw");
                  }}
                  disabled={mode === "draw"}
                >
                  Draw
                </button>
              </div>
            </Grid>
            <Grid
              xs={12}
              md={12}
              sx={{
                overflow: "auto",
                border: "1px solid #000",
              }}
            >
              <canvas
                ref={canvas}
                width={mel[0].length * scale}
                height={256}
                onMouseDown={() => {
                  setMouseDown(true);
                }}
                onMouseUp={() => {
                  setMouseDown(false);
                  setPrevIndex(null);
                }}
                onMouseMove={(e) => onMouseMove(e)}
              />
              <canvas
                ref={melCanvas}
                width={mel[0].length * scale}
                height={512}
                hidden
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}
