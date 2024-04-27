import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import PaperWithPadding from "./PaperWithPadding";

export type LabeledFile = {
  name: string;
  labeled: boolean;
  file: File;
  labelFileName: string;
  text?: string;
  pinYin?: string;
  directoryHandle: FileSystemDirectoryHandle;
};

type FileSelectorProps = {
  files: LabeledFile[];
  setFiles: (files: LabeledFile[]) => void;
  selected: LabeledFile | null;
  setSelected: (file: LabeledFile) => void;
};

const FileSelector = ({
  files,
  setFiles,
  selected,
  setSelected,
}: FileSelectorProps) => {
  const onSelectFolder = async () => {
    const win = window as any;

    if (!win.showDirectoryPicker) {
      alert("当前浏览器不支持文件夹选择");
      return;
    }

    const directoryHandle = await win.showDirectoryPicker({
      id: "select-audio-folder",
      mode: "readwrite",
    });

    const temp = [];
    for await (const handle of directoryHandle.values()) {
      if (
        handle.kind !== "file" ||
        (!handle.name.endsWith(".mp3") &&
          !handle.name.endsWith(".wav") &&
          !handle.name.endsWith(".flac") &&
          !handle.name.endsWith(".ogg"))
      ) {
        continue;
      }

      const file: File = await handle.getFile();
      let labeled = false;
      let text = "";
      let pinYin = "";

      const parts = handle.name.split(".");
      const nameWithoutExt = parts.slice(0, parts.length - 1).join(".");
      const labelFileName = `${nameWithoutExt}.lab`;

      try {
        const file: FileSystemFileHandle = await directoryHandle.getFileHandle(
          labelFileName
        );
        const labelFile = await file.getFile();
        const annotated = await labelFile.text();

        // Split by line breaks, first line is the text, second line is the pinyin
        [text, pinYin] = annotated.split("\n");

        labeled = true;
      } catch (e) {}

      temp.push({
        name: handle.name,
        labeled,
        text,
        pinYin,
        file,
        labelFileName,
        directoryHandle,
      });
    }

    // Sort by name
    temp.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    setFiles(temp);
    setSelected(temp[0]);
  };

  const numLabeled = files.filter((file) => file.labeled).length;

  return (
    <Stack spacing={2}>
      <PaperWithPadding>
        <Button variant="outlined" fullWidth onClick={onSelectFolder}>
          选择目录
        </Button>
      </PaperWithPadding>
      <PaperWithPadding sx={{ textAlign: "center" }}>
        {files.length > 0
          ? `已完成 ${numLabeled} / ${files.length}`
          : "未选择文件"}

        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {files.map((file, index) => (
            <ListItem disablePadding key={index}>
              <ListItemButton
                selected={selected === file}
                autoFocus={selected === file}
                onClick={() => setSelected(file)}
              >
                <ListItemIcon>
                  {file.labeled ? (
                    <CheckCircleOutlinedIcon />
                  ) : (
                    <PendingOutlinedIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={file.name} sx={{ margin: 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </PaperWithPadding>
    </Stack>
  );
};

export default FileSelector;
