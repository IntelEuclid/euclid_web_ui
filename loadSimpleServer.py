#!/usr/bin/python
from server.HttpServer import HttpWebServer, setSafeMode
from BaseHTTPServer import HTTPServer
import sys

class WebServer():

    def __init__(self, httpPort, isSafeMode = False):
        self._httpPort = int(httpPort)
	self._isSafeMode=bool(isSafeMode)
        self._ip = ''

    def _startHttpServer(self):
        print("Starting HTTP Server {}:{}".format(self._ip, self._httpPort))
        self._httpServer = HTTPServer((self._ip, self._httpPort), HttpWebServer)
	setSafeMode((self._isSafeMode))
        self._httpServer.serve_forever()

    def _stopHttpServer(self):
        self._httpServer.socket.close()
        if self._httpThread:
            self._httpThread.cancel()

    def start(self):
        return self._startHttpServer()

    def stop(self):
        self._stopHttpServer()

if __name__ == "__main__":
    print("**************************")
    port = 80
    isSafeMode = False
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    if len(sys.argv) > 2:
        isSafeMode = sys.argv[2] == "True"
    print(sys.argv[2])
    print(sys.argv)
    print("**************************")
    print("**************************")
    print("port = " + str(port) + " isSafeMode = " + str(isSafeMode))
    try:
        server = WebServer(port, isSafeMode)
        server.start()
    except:
        server.stop()
        exit()
