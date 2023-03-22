import Head from "next/head";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Container,
  IconButton,
  Paper,
  styled,
  Button,
  ButtonGroup,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import SelectIcon from "@mui/icons-material/SelectAll";
import DownloadIcon from "@mui/icons-material/Download";
import DrawIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import CheckIcon from "@mui/icons-material/Check";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  drawMel,
  drawPitches,
  drawSelectedArea,
  melToF,
} from "@/components/MelSpec";
import Link from "next/link";

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  ...theme.typography.h5,
  textAlign: "center",
  alignContent: "center",
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
}));

const COLORS = ["rgba(255, 0, 0, 1)", "rgba(0, 0, 255, 1)"];

export default function PitchEditor() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"select" | "draw">("draw");
  const [mouseDown, setMouseDown] = useState(false);
  const [scale, setScale] = useState(1);
  const [mel, setMel] = useState<number[][]>();
  const [pitches, setPitches] = useState<{ [key: string]: number[] }>();
  const [selectedPitch, setSelectedPitch] = useState<string>("final");
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [currIndex, setCurrIndex] = useState<number | null>(null);
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

    // Draw the pitches
    drawPitches(canvas.current, pitches["final"], COLORS[0]);

    if (selectedPitch && selectedPitch !== "final") {
      drawPitches(canvas.current, pitches[selectedPitch], COLORS[1]);
    }

    // Draw the selected region
    if (prevIndex && currIndex && mode === "select") {
      drawSelectedArea(canvas.current, prevIndex, currIndex);
    }

    console.log(`Drawn pitches in ${performance.now() - start}ms`);
  }, [
    mode,
    canvas,
    selectedPitch,
    melCanvas,
    pitches,
    scale,
    prevIndex,
    currIndex,
  ]);

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

  // Apply the selected pitch to the final pitch
  const applySelection = () => {
    // If no pitch is selected, do nothing
    if (!pitches || !selectedPitch || selectedPitch === "final") return;

    // If no selection is made, do nothing
    if (!prevIndex || !currIndex) return;

    // Get the selected pitch
    const selected = pitches[selectedPitch];

    // Calculate the start and end index of the selection
    const start = Math.min(prevIndex, currIndex) * scale;
    const end = Math.max(prevIndex, currIndex) * scale;

    // Get the pitch values from the selected pitch
    const pitchValues = selected.slice(start, end);

    // Update the final pitch
    setPitches((prevPitches) => {
      const updatedPitches = { ...prevPitches };
      updatedPitches["final"].splice(start, pitchValues.length, ...pitchValues);
      return updatedPitches;
    });
  };

  // Save the final pitch to a file
  const download = () => {
    if (!pitches) return;

    const blob = new Blob([JSON.stringify(pitches["final"])], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pitches.json";
    link.click();
  };

  // Handle mouse events
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setMouseDown(true);

    if (mode === "select") {
      setPrevIndex(e.nativeEvent.offsetX);
      setCurrIndex(e.nativeEvent.offsetX);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvas.current || !mouseDown) return;

    if (mode === "select") {
      setCurrIndex(e.nativeEvent.offsetX);
    } else if (mode === "draw") {
      updatePitches(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setMouseDown(false);

    if (mode === "draw" || prevIndex === currIndex) {
      setPrevIndex(null);
      setCurrIndex(null);
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
                Fish Pitch Labeler
                <IconButton sx={{ color: "#000" }} onClick={openRepo}>
                  <GitHubIcon />
                </IconButton>
                <Link href="/">Audio Labeler</Link>
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
              {/* Select file */}
              <ButtonGroup variant="outlined" color="primary">
                <Button
                  component="label"
                  startIcon={<UploadIcon />}
                  variant="outlined"
                  color="primary"
                >
                  Upload
                  <input
                    hidden
                    type="file"
                    accept=".json"
                    onChange={onFileSelected}
                  />
                </Button>
                {/* Download */}
                <Button
                  sx={{ ml: "8px" }}
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  color="primary"
                  onClick={download}
                >
                  Save
                </Button>
              </ButtonGroup>
              {/* All pitch names */}
              <ButtonGroup variant="outlined" color="primary">
                {/* Show all pitch keys */}
                {Object.keys(pitches || {}).map((name) => (
                  <Button
                    key={name}
                    onClick={() => {
                      setSelectedPitch(name);
                    }}
                    disabled={selectedPitch === name}
                  >
                    {name}
                  </Button>
                ))}
                {/* Apply selected region */}
                {pitches && (
                  <Button
                    sx={{ ml: "16px" }}
                    variant="outlined"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={applySelection}
                  >
                    Apply
                  </Button>
                )}
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
                  paddingBottom: "16px", // For scrollbar
                }}
              >
                {/* Mel canvas */}
                <canvas
                  ref={canvas}
                  width={mel ? mel[0].length * scale : 100}
                  height={512}
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                  onMouseMove={(e) => onMouseMove(e)}
                />
                <canvas
                  ref={melCanvas}
                  width={mel ? mel[0].length * scale : 100}
                  height={512}
                  hidden
                />
              </div>
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}
