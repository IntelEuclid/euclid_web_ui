import os
import sys
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from os import curdir, sep, listdir
import cgi
import Cookie
import socket
import hashlib
from utils.pam import PamAuthentication
import NetworkFlowFacade
import CsOobeHelper

TARGET_UPDATE_DIR = "/intel/euclid_update/"
DISABLE_AUTHENTICATION = True
IS_SAFE_MODE = False

def setSafeMode(mode):
    global IS_SAFE_MODE
    IS_SAFE_MODE = bool(mode)
    print("safe mode = " + str(IS_SAFE_MODE))

class HttpWebServer(BaseHTTPRequestHandler):

    def isAuthenticated(self):
        if DISABLE_AUTHENTICATION or self.isExceptionPath():
            return True

        if "Cookie" not in self.headers:
            return False

        c = Cookie.SimpleCookie(self.headers["Cookie"])

        if 'AUTH' in c:
            session = c['AUTH'].value
            host = socket.gethostname()
            hashed_session = hashlib.md5(host).hexdigest()
            if hashed_session == session:
                return True
        return False

    def isFirstTime(self):
        return not os.path.isfile('/intel/euclid/config/licenseAccepted')

    def processMime(self):
        mimetype = None
        if self.path.endswith(".log"):
            mimetype = 'text/plain'
        if self.path.endswith(".txt"):
            mimetype = 'text/plain'
        if self.path.endswith(".html"):
            mimetype = 'text/html'
        if self.path.endswith(".jpg"):
            mimetype = 'image/jpg'
        if self.path.endswith(".gif"):
            mimetype = 'image/gif'
        if self.path.endswith(".png"):
            mimetype = 'image/png'
        if self.path.endswith(".js"):
            mimetype = 'application/javascript'
        if self.path.endswith(".css"):
            mimetype = 'text/css'
        if self.path.endswith(".woff") or self.path.endswith(".woff2"):
            mimetype = 'application/x-font-woff'
        if self.path.endswith(".zip"):
            mimetype = 'application/x-zip-compressed'

        return mimetype, True if mimetype else False

    def isExceptionPath(self):
        white_list = ["imu_graph.html", "view.html"]
        if self.path.endswith(".html"):
            for html_path in white_list:
                if self.path.endswith(html_path):
                    return True
            return False
        return True

    # Handler for the GET requests
    def do_GET(self):

        if '?' in self.path:
            self.path = self.path.split('?')[0]

        if self.path == "/":
            self.path = "/index.html"

	global IS_SAFE_MODE
        if not self.isExceptionPath():
	    if IS_SAFE_MODE is True:
		self.path = "/safe_mode.html"
		print("******************************************************** SAFE MODE ********************************************************")
            if self.isFirstTime():
                self.path = "/license.html"
            if not self.isAuthenticated():
                self.path = "/login.html"

        if self.path.endswith("/logs"):
                files = listdir(curdir + sep + self.path)
                print(files)
                strfile = ",".join(files)
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(strfile)
                return

        try:
            mimetype, sendReply = self.processMime()
            # Open the static file requested and send it
            f = open(curdir + sep + self.path)
            self.send_response(200)
            self.send_header('Content-type', mimetype)
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
            return

        except IOError:
            self.send_error(404, 'File Not Found: %s' % self.path)

    def uploadFile(self):
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST'}
        )
        if not form.has_key('updateFile'):
            self.send_response(400)
            self.end_headers()
            self.wfile.write("no update file")
            return
        fileItem = form['updateFile']
        if not fileItem.file:
            return
        fout = file(os.path.join(TARGET_UPDATE_DIR, fileItem.filename), 'wb')
        while(1):
            chunk = fileItem.file.read(1000)
            if not chunk:
                break
            fout.write(chunk)
        fout.close()

        self.send_response(200)
        self.end_headers()
        self.wfile.write("File uploaded successfuly")
        return

    def rejectUser(self):
        self.send_response(200)
        self.send_header(
            'Set-Cookie', 'AUTH= ; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT')
        self.end_headers()
        self.wfile.write("false")

    def acceptUser(self):
        self.send_response(200)
        # Calculate the hashed hostname and set cookie
        host = socket.gethostname()
        hashed_session = hashlib.md5(host).hexdigest()
        self.send_header('Set-Cookie', 'AUTH=' + hashed_session + ';')
        self.end_headers()
        self.wfile.write("true")

    def login(self):
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST'}
        )
        username = form.getvalue('username')
        password = form.getvalue('password')
        auth = PamAuthentication(username, password)
        if username == None or password == None or auth.authenticate() == False:
            self.rejectUser()
        else:
            self.acceptUser()

    def accept(self):
        self.send_response(200)
        self.end_headers()
        if not os.path.isfile('/intel/euclid/config/licenseAccepted'):
            open('/intel/euclid/config/licenseAccepted', 'a').close()
            self.wfile.write("true")
	else:
	    self.wfile.write("false")

    def reconnect(self):
	global IS_SAFE_MODE
        if IS_SAFE_MODE == True:
            self.send_response(200)
            self.end_headers()
            self.wfile.write("true")
            res = NetworkFlowFacade.NetworkFlowFacade.RequestReConnectNetwork()
	    print(res)

    def restart_device(self):
	global IS_SAFE_MODE
        if IS_SAFE_MODE == True:
            self.send_response(200)
            self.end_headers()
            self.wfile.write("true")
            CsOobeHelper.Reboot()

    def do_POST(self):
        if self.path == "/software_update":
            self.uploadFile()
        elif self.path == "/login":
            self.login()
        elif self.path == "/accept":
            self.accept()
        elif self.path == "/restart_device":
                self.restart_device()
        elif self.path == "/reconnect":
            self.reconnect()
        else:
            self.send_response(404)
