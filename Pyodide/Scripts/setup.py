from setuptools import setup, find_packages

setup(
    name="simpliPFyBuildTools",
    version="0.1.0",
    description="Helper scripts for simplipfy build and release process",

    author="simpliPFy.org Team",
    author_email="info@simplipfy.org",

    url="https://github.com/prof-sky/simplipfy/tree/main/Pyodide/Scripts",

    license="MIT",

    packages=find_packages(exclude=("tests", "docs")),

    python_requires=">=3.9",

    install_requires=[
        "dotenv"
    ]
)