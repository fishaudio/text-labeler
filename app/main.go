package main

import (
	"embed"
	"log"
	"mime"
	"net/http"
	"os/exec"
	"runtime"
)

//go:embed all:out/*
var out embed.FS

func open(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
	}
	args = append(args, url)
	return exec.Command(cmd, args...).Start()
}

func main() {
	_ = mime.AddExtensionType(".js", "text/javascript")
	_ = mime.AddExtensionType(".css", "text/css")

	// Serve the static files at the root of the server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/out" + r.URL.Path

		http.FileServer(http.FS(out)).ServeHTTP(w, r)
	})

	log.Print("Listening on http://localhost:3000")
	go open("http://localhost:3000")

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
