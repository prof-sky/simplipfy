from http.server import ThreadingHTTPServer, test
from simpliPFyBuildTools.GzipSimplePythonHttpServer import HTTPCompressionRequestHandler
import contextlib
import socket

# ensure dual-stack is not disabled; ref #38907
class DualStackServer(ThreadingHTTPServer):

    def server_bind(self):
        # suppress exception when protocol is IPv4
        with contextlib.suppress(Exception):
            self.socket.setsockopt(
                socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        return super().server_bind()

    def finish_request(self, request, client_address):
        self.RequestHandlerClass(request, client_address, self,
                                 directory="./")

def localServer(port, bind):
    test(
        HandlerClass=HTTPCompressionRequestHandler,
        ServerClass=DualStackServer,
        port=port,
        bind=bind,
        protocol='HTTP/1.0',
    )