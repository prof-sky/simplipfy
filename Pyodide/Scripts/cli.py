import argparse
import os.path
from socket import gethostname

from cli.buildBundles import create_bundles, srcPath
from cli.generateSVGFiles import SVGFileGenerator, circuitFiles
from cli.makeDist import makeDist, distSrc, distDst
from simpliPFyBuildTools.hashFolder import hash_folder
from simpliPFyBuildTools.zipFolder import zip_folder
from simpliPFyBuildTools.localServer import localServer
from os import chdir
from cli.buildDocs import pdbfp as docsBuildPath
from cli.buildDocs import buildDocs, uploadDocs
from cli.release import makeRelease
from cli.startServer import startServer
from cli.dockerQuickReleaseDev import quickReleaseDev
from cli.dockerCopyDistToDev import copyToServer
from simpliPFyBuildTools.buildSimplipfy import build_simplipfy
from simpliPFyBuildTools.buildSchemdrawInskale import build_schemdraw
from simpliPFyBuildTools.buildLcapyInskale import build_lcapyInskale
from simpliPFyBuildTools.bumpVersion import versionChangeOpts, lcapyFolder, simplipfyFolder, schemdrawFolder
from simpliPFyBuildTools.checkLanguages import checkLanguages
from simpliPFyBuildTools.generateNewLang import generateNewLang
from typing import get_args

helpStr = "usage: simplipfy [cmd] [option] see documentation at docs.simpliPFy.org"

def hostDocs(port: int, bind="127.0.0.1"):
    chdir(docsBuildPath)
    localServer(port, bind)

mainParser = argparse.ArgumentParser(description="Command Line Interface for simplipfy project")
mainParser.add_argument("--version", action="store_true")
subparsers = mainParser.add_subparsers(dest="command", required=False, help=helpStr)
###############
# Build Parser
###############
buildParser = subparsers.add_parser("build")
buildParser.add_argument(
    'target',
    choices=['bundles', 'svgs', 'dist', 'localhost', "simplipfy", "lcapy-inskale", "schemdraw"],
)
buildParser.add_argument(
    '--zip',
    action="store_true",
)
buildParser.add_argument(
    "--port",
    type=int,
    default=8000,
)
buildParser.add_argument(
    "--bind",
    type=str,
    default="127.0.0.1",
)
buildParser.add_argument(
    "--version-change",
    choices=get_args(versionChangeOpts),
    default="patch",
)
###############
# Docs Parser
###############
docsParser = subparsers.add_parser("docs")
docsParser.add_argument(
    "action",
    choices=["build", "localhost", "upload"],
)
docsParser.add_argument(
    '--upload',
    action="store_true",
)
docsParser.add_argument(
    "--port",
    type=int,
    default=7500,
)
docsParser.add_argument(
    "--localhost",
    action="store_true",
)
docsParser.add_argument(
    "--bind",
    type=str,
    default="127.0.0.1",
)
###############
# release Parser
###############
releaseParser = subparsers.add_parser("release")
releaseParser.add_argument("target", choices=["dev", "simplipfy"],
                           help="action to perform\n" +
                         "dev: release to dev.simplipfy.org\n" +
                         "simplipfy: releases to www.simplipfy.org\n")
releaseParser.add_argument("--sha", type=str, default=None)
releaseParser.add_argument("--tag", type=str, default=None)

###############
# hash Parser
###############
hashParser = subparsers.add_parser("hash")
hashParser.add_argument('target',
    choices=["simplipfy", "lcapy-inskale", "schemdraw"],
)
hashParser.add_argument('-i', '--include', type=str, default="**/*.py",)

###################
# language Parser
###################
languageParser = subparsers.add_parser("language")
languageParser.add_argument('action',
    choices=["check", "build"],
)

# check
languageParser.add_argument("--path", "-p", default=None, type=str,
                    help="Path to folder containing language folders, from project root")
languageParser.add_argument("--mainLang", "-l", default="en", type=str, help="Main language which the others are compared to",
                    choices=("en", "de"))
languageParser.add_argument("--noErrors", "-e", action="store_false", default=True,
                    help="Raise error if differences are found, else only prints the error but continues")

# build
languageParser.add_argument("newLang", nargs="?",
                    help="Short name for the new language, should be 2 characters long, e.g. en, de, fr..")
languageParser.add_argument("--override", "-o", action="store_true", default=False,
                    help="Override existing language files, if they exists, else create a new one")

###################
# docker quick build Parser
###################
dockerQuickBuild = subparsers.add_parser("quickBuild")
dockerQuickBuild.add_argument('--copy', action="store_true", default=False, help="Skip generation and only copy current dist folder to the docker server")

args = mainParser.parse_args()
if args.command == "build":
    if args.target == "bundles":
        create_bundles(srcPath)
    elif args.target == "svgs":
        SVGFileGenerator(circuitFiles).generateAllFiles()
        if args.zip:
            zip_folder(circuitFiles)

    elif args.target == "dist":
        makeDist(distSrc, distDst)

    elif args.target == "localhost":
        if not os.path.isdir(distDst):
            os.mkdir(distDst)
        chdir(distDst)
        startServer(args.port, args.bind)

    elif args.target == "simplipfy":
        build_simplipfy(args.version_change)
    elif args.target == "lcapy-inskale":
        build_lcapyInskale(args.version_change)
    elif args.target == "schemdraw":
        build_schemdraw(args.version_change)

elif args.command == "docs":
    if args.action == "build":
        buildDocs()

        if args.upload:
            uploadDocs()

        if args.localhost:
            print(args.bind)
            hostDocs(args.port, args.bind)

    elif args.action == "upload":
        uploadDocs()

    elif args.action == "localhost":
        hostDocs(args.port, args.bind)

elif args.command == "release":
    makeRelease(args.target, args.sha, args.tag)

elif args.command == "hash":
    if args.target == "lcapy-inskale":
        print(hash_folder(lcapyFolder, args.include).hexdigest())
    elif args.target == "schemdraw":
        print(hash_folder(schemdrawFolder, args.include).hexdigest())
    elif args.target == "simplipfy":
        print(hash_folder(simplipfyFolder, args.include).hexdigest())

elif args.command == "language":
    if args.action == "check":
        checkLanguages(args.path, args.mainLang, args.noErrors)
    elif args.action == "build":
        if not args.newLang:
            raise ValueError("newLang is required to build a language")
        generateNewLang(args.newLang, override=args.override)

elif args.command == "quickBuild":
    if gethostname() != "simplipfyDockerContainer":
        """
        This only works if the server folder is directly accessible to copy files to (docker container)
        """
        exit("Not in simplipfy docker container")

    if args.copy:
        copyToServer()
    else:
        quickReleaseDev()

if args.version:
    print("SimpliPFy CLI Script Version 1.0")

if not args.command:
    print(helpStr)