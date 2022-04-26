package main

import (
	"embed"
	"encoding/json"
	"flag"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/mochi-co/mqtt/server"
	"github.com/mochi-co/mqtt/server/listeners"
)

//go:embed index.html
var web embed.FS

var mqttListen = ":11883"
var httpListen = ":8080"

var upgrader = websocket.Upgrader{
	WriteBufferSize: 1024,
	ReadBufferSize:  1024,
}

// TODO github oauth
type Auth struct {
}

func (auth *Auth) Authenticate(user, password []byte) bool {
	return true
}
func (auth *Auth) ACL(user []byte, topic string, write bool) bool {
	return true
}

func main() {
	flag.StringVar(&mqttListen, "mqtt", mqttListen, "mqtt listen address")
	flag.StringVar(&httpListen, "http", httpListen, "http server address")
	flag.Parse()

	mqttServer := server.New()
	l := listeners.NewTCP("main", mqttListen)
	err := mqttServer.AddListener(l, &listeners.Config{
		Auth: &Auth{},
	})
	if err != nil {
		log.Fatal(err)
	}
	go func() {
		log.Println("start mqtt on", mqttListen)
		err = mqttServer.Serve()
		if err != nil {
			log.Fatal(err)
		}
	}()
	http.Handle("/", http.FileServer(http.FS(web)))
	http.HandleFunc("/control_ws", func(rw http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(rw, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		defer conn.Close()
		for {
			var control struct {
				U    bool `json:"u"`
				D    bool `json:"d"`
				L    bool `json:"l"`
				R    bool `json:"r"`
				S    int  `json:"s"`
				Ping bool `json:"p"`
			}
			err = conn.ReadJSON(&control)
			if err != nil {
				log.Println("read message", err)
				return
			}
			if control.Ping {
				mqttServer.Publish("/guest/che/ping", []byte{}, false)
				continue
			}
			data, err := json.Marshal(&control)
			if err != nil {
				panic(err)
			}
			log.Println("control", string(data))
			mqttServer.Publish("/guest/che/control", data, false)
		}
	})
	log.Println("start http on", httpListen)
	http.ListenAndServe(httpListen, nil)
}
