import {
  Button,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import PaperWithPadding from "./PaperWithPadding";
import { useEffect, useState } from "react";
import pinyin from "pinyin";

type AudioLabelerProps = {
  audio: string;
  text: string;
  pinYin: string;
  onPrev: (text: string, pinYin: string) => void;
  onNext: (text: string, pinYin: string) => void;
  onSave: (text: string, pinYin: string) => void;
  onDelete: () => void;
};

const getBooleanFromLocalStorage = (key: string, defaultValue: boolean) => {
  const value = localStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }

  return value === "true";
};

const AudioLabeler = ({
  audio,
  onPrev,
  onNext,
  onSave,
  onDelete,
  text,
  pinYin,
}: AudioLabelerProps) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoPinYin, setAutoPinYin] = useState(true);
  const [autoNext, setAutoNext] = useState(true);
  const [tempText, setTempText] = useState(text);
  const [tempPinYin, setTempPinYin] = useState(pinYin);

  useEffect(() => {
    setTempText(text);
    setTempPinYin(pinYin);
  }, [text, pinYin]);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (autoNext && event.keyCode === 13 && !!tempPinYin) {
        event.preventDefault();
        onNext(tempText, tempPinYin);
      }

      // Ignore Enter
      if (event.keyCode === 13) {
        event.preventDefault();
      }

      // If Command + S is pressed
      if (event.keyCode === 83 && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSave(tempText, tempPinYin);
      }
    };

    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [tempPinYin, autoNext, onSave, onNext]);

  useEffect(() => {
    setAutoNext(getBooleanFromLocalStorage("autoNext", true));
    setAutoPlay(getBooleanFromLocalStorage("autoPlay", true));
    setAutoPinYin(getBooleanFromLocalStorage("autoPinYin", true));
  }, []);

  const onUpdateAutoPlay = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoPlay", e.target.checked);
    }
    setAutoPlay(e.target.checked);
  };

  const onUpdateAutoPinYin = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoPinYin", e.target.checked);
    }
    setAutoPinYin(e.target.checked);
  };

  const onUpdateAutoNext = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoNext", e.target.checked);
    }
    setAutoNext(e.target.checked);
  };

  const onUpdateText = (e: any) => {
    setTempText(e.target.value);

    if (autoPinYin) {
      const pinyinResult = pinyin(e.target.value, {
        style: pinyin.STYLE_NORMAL,
      });

      setTempPinYin(pinyinResult.map((item) => item[0]).join(" "));
    }
  };

  const disabled = !audio;

  return (
    <Stack spacing={2}>
      <PaperWithPadding>
        <AudioPlayer
          autoPlay={false}
          autoPlayAfterSrcChange={autoPlay}
          src={audio}
        />
      </PaperWithPadding>
      <PaperWithPadding>
        <FormGroup row>
          <FormControlLabel
            control={<Switch checked={autoPlay} />}
            label="自动播放"
            onChange={onUpdateAutoPlay}
            disabled={disabled}
          />
          <FormControlLabel
            control={<Switch checked={autoPinYin} />}
            label="更新拼音"
            onChange={onUpdateAutoPinYin}
            disabled={disabled}
          />
          <FormControlLabel
            control={<Switch checked={autoNext} />}
            label="回车自动下一个"
            onChange={onUpdateAutoNext}
            disabled={disabled}
          />
        </FormGroup>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2}>
          <TextField
            label="中文"
            multiline
            fullWidth
            rows={2}
            onChange={onUpdateText}
            value={tempText}
            disabled={disabled}
          />

          <TextField
            label="拼音 (自动转换)"
            multiline
            fullWidth
            rows={4}
            value={tempPinYin}
            onChange={(e) => setTempPinYin(e.target.value)}
            disabled={disabled}
          />
        </Stack>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2} direction="row">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onPrev(tempText, tempPinYin)}
          >
            上一个
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onNext(tempText, tempPinYin)}
          >
            下一个 {autoNext ? "(Enter)" : ""}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onSave(tempText, tempPinYin)}
          >
            保存 (Ctrl + S)
          </Button>
          <Button variant="outlined" fullWidth onClick={onDelete} color="error">
            删除
          </Button>
        </Stack>
      </PaperWithPadding>
    </Stack>
  );
};

export default AudioLabeler;
