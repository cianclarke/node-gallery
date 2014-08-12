#!/bin/bash
#
# This script deploys the app updating is as submodule
# Config:
# root of the repository that hosts gallery as submodule 
reporoot=/home/flowebadm/deployment/ekukka
#path to the submodule
submodroot="$reporoot/ekukka_gallery"
#root on local filesystem where the app is deployed
approot=/home/flowebadm/ekukka_gallery
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
(cd $reporoot && git submodule update)
(cd $reporoot && git pull && git checkout master)
(cp -r "$submodroot/*" "$approot/")
