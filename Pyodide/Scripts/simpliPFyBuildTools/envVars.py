import os
from dotenv import load_dotenv
from typing import Union, Literal

OptStr = Union[str, None]
RelOption = Literal["dev", "simplipfy"]

class EnvVars:
    """
    This class loads environment variables.
    Add the variable to the attributes of this class and to _env_map.
    The attribute of this class acts as a nice to use name in code.
    The _env_map attribute loads the value form the environment with the specified name.
    """

    server: str
    user: str
    password: str
    devFolder: str
    simplipfyFolder: str
    docsFolder: str
    commitSHA: str
    commitTag: str
    apiSecret: str
    dbName: str
    dbUser: str
    dbPass: str

    _env_map = {
        "server": "FTP_SERVER",
        "user": "FTP_USER",
        "password": "FTP_PASS",
        "devFolder": "FTP_FOLDER_DEV",
        "simplipfyFolder": "FTP_FOLDER_RELEASE",
        "docsFolder": "FTP_FOLDER_DOCS",
        "commitSHA": "CI_COMMIT_SHA",
        "commitTag": "CI_COMMIT_TAG",
        "apiSecret": "API_SECRET",
        "dbName": "DB_NAME",
        "dbUser": "DB_USER",
        "dbPass": "DB_PASSWORD",
        "sessionLimit": "SESSION_LIMIT",
        "entryLimit": "ENTRY_LIMIT",
    }

    def __init__(self, **kwargs):
        """
        Create an instance of Environment variables.
        You can optionally override or create values by passing them as kwargs
        :param str server
        :param str user
        :param str password
        :param str devFolder
        :param str simplipfyFolder
        :param str docsFolder
        :param str commitSHA
        :param str commitTag
        :param str apiSecret
        :param str dbName
        :param str dbUser
        :param str dbPass
        :param str sessionLimit
        :param str entryLimit
        """
        load_dotenv()
        for key, value in kwargs.items():
            object.__setattr__(self, key, value)

    def __getattribute__(self, name):
        try:
            val = object.__getattribute__(self, name)
        except AttributeError:
            val = None

        if val is not None:
            return val

        _env_map = object.__getattribute__(self, "_env_map")
        if name in _env_map:
            return os.getenv(_env_map[name])
        raise AttributeError(f"key is not specified key:{name}. Add to class EnvVars and provide as environment variable")

    def getReleaseFolderName(self, relOption: RelOption = "dev") -> str:
        """:returns commit sha for dev releases and commit tag for releases to simplipfy.org"""
        if relOption == "dev":
            return self.commitSHA

        elif relOption == "simplipfy":
            return self.commitTag

        else:
            raise ValueError(f"relOption must be in: {list(RelOption)}")
