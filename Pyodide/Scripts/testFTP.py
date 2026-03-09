from ftplib import FTP

ftp = FTP("127.0.0.1")
ftp.login("ftp-user", "ftp-pass")
print(f"current dir: {ftp.pwd()}")
ftp.delete("dev/index.html")
ftp.quit()