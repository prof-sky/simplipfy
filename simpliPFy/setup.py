#!/usr/bin/env python
from setuptools import find_packages, setup

__version__ = '0.1.dev3'

long_description = "Backend for interactive learning environment for electrical engineering hosted at simplipfy.org"

tests_require = ['pytest']


setup(name='simpliPFy',
      version=__version__,
      author='Yannick Wieland',
      author_email='yannick.wieland@hs-pforzheim.de',
      description='Backend for interactive learning environment for electrical engineering',
      long_description=long_description,
      long_description_content_type="text/markdown",
      url='https://github.com/prof-sky/simplipfy/tree/main/simpliPFy',
      download_url='https://github.com/prof-sky/simplipfy/tree/main/simpliPFy',
      install_requires=['lcapyInskale', 'schemdrawInskale'],
      python_requires='>=3.7',  # >=3.6 should still work but not tested
      extras_require={
          'test': tests_require,
          'release': ['wheel', 'twine'],
      },
      license='LGPL-2.1-or-later',
      packages=find_packages(exclude=['demo']),
      entry_points={},
      classifiers=[
          "Programming Language :: Python :: 3",
          "Operating System :: OS Independent",
      ],
      )
