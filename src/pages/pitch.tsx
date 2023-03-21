import Head from "next/head";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Container,
  IconButton,
  Paper,
  styled,
  Button,
  ButtonGroup,
  Divider,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import SelectIcon from "@mui/icons-material/SelectAll";
import DrawIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [mel, setMel] = useState<number[][]>();
  const [pitches, setPitches] = useState<{ [key: string]: number[] }>();
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const melCanvas = useRef<HTMLCanvasElement>(null);

  // All references to other mels
  const melRefs = useRef<{
    [key: string]: HTMLCanvasElement | null;
  }>({});

  const openRepo = () => {
    window.open("https://github.com/fishaudio/text-labeler", "_blank");
  };

  const onFileSelected = (e: any) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string);
      setMel(data.mel);
      setPitches(data.pitches);

      // Generate mel refs
      let refs: {
        [key: string]: null;
      } = {};

      for (const key in data.pitches) {
        if (key === "final") {
          continue;
        }

        refs[key] = null;
      }

      melRefs.current = refs;
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (!melCanvas.current || !mel) return;

    const start = performance.now();
    drawMel(melCanvas.current, mel);
    console.log(`Drawn mel in ${performance.now() - start}ms`);
  }, [melCanvas, mel, scale]);

  useEffect(() => {
    if (!canvas.current || !melCanvas.current || !pitches) return;

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

  // Draw all melRefs
  useEffect(() => {
    if (!melCanvas.current || !mel || !pitches) return;
    for (const i in melRefs.current) {
      const melRef = melRefs.current[i];
      if (!melRef) continue;

      const start = performance.now();
      melRef
        .getContext("2d")
        ?.drawImage(melCanvas.current, 0, 0, melRef.width, melRef.height);
      drawPitches(melRef, pitches[i] || []);
      console.log(`Drawn mel ref ${i} in ${performance.now() - start}ms`);
    }
  }, [melCanvas, mel, pitches, scale]);

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

    if (mode === "draw") {
      updatePitches(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
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
            <Grid
              xs={12}
              md={12}
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <ButtonGroup variant="outlined" color="primary">
                {/* Select file */}
                <Button component="label" startIcon={<UploadIcon />}>
                  Select
                  <input
                    hidden
                    type="file"
                    accept=".json"
                    onChange={onFileSelected}
                  />
                </Button>
              </ButtonGroup>
              <ButtonGroup variant="outlined" color="primary">
                {/* Zoom */}
                <Button onClick={() => setScale((prevScale) => prevScale * 2)}>
                  <ZoomInIcon />
                </Button>
                <Button onClick={() => setScale((prevScale) => prevScale / 2)}>
                  <ZoomOutIcon />
                </Button>
                {/* Selection */}
                <Button
                  onClick={() => {
                    setMode("select");
                  }}
                  disabled={mode === "select"}
                >
                  <SelectIcon />
                </Button>
                {/* Drawing */}
                <Button
                  onClick={() => {
                    setMode("draw");
                  }}
                  disabled={mode === "draw"}
                >
                  <DrawIcon />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={12} md={12}>
              <div
                style={{
                  overflow: "auto",
                  border: "1px solid #000",
                }}
              >
                {/* Mel canvas */}
                Output
                <canvas
                  ref={canvas}
                  width={mel ? mel[0].length * scale : 100}
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
                  width={mel ? mel[0].length * scale : 100}
                  height={256}
                  hidden
                />
                {/* Add other mels */}
                {Object.entries(melRefs.current).map((kv, i) => (
                  <>
                    {kv[0]}
                    <canvas
                      key={i}
                      ref={(ref) => (melRefs.current[kv[0]] = ref!)}
                      width={mel ? mel[0].length * scale : 100}
                      height={256}
                    />
                  </>
                ))}
              </div>
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}
