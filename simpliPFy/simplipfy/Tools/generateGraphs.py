import os
import shutil
from os import walk
from generalizeNetlistDrawing.circuitToGraph import CircuitToGraph
from generalizeNetlistDrawing.graph_backend import GraphType
from lcapyInskale import Circuit
import matplotlib.pyplot as plt
from networkx import MultiGraph, draw_networkx_edge_labels, draw_networkx_edges, draw_networkx_labels, \
    draw_networkx_nodes, spring_layout
from generalizeNetlistDrawing.backends.search.multiDiGraph.findParallelNodes import potParaNodes, isParaNodePair
from generalizeNetlistDrawing.backends.search.multiDiGraph.functionsOnGraph import edgesBetweenNodes

def generate_graph_from_circuit(cct: Circuit, fName: str, path=""):
    trans = CircuitToGraph(cct, GraphType)
    graph = trans.NetlistGraph.graph

    paraNodes = potParaNodes(graph)
    for nodePair in reversed(paraNodes):
        if not isParaNodePair(graph, nodePair[0], nodePair[1]):
            paraNodes.remove(nodePair)

    for nodePair in paraNodes:
        paraEdges = edgesBetweenNodes(graph, nodeAB=nodePair)
        newName = ""
        for edge in paraEdges:
            newName += (edge[2] + " & ")
        newName = newName[:-3]

        graph.remove_edge(paraEdges[0][0], paraEdges[0][1])
        graph.add_edge(nodePair[0], nodePair[1], key=newName)


    # Visualize the graph
    pos = spring_layout(graph)
    draw_networkx_nodes(graph, pos)
    draw_networkx_edges(graph, pos)
    draw_networkx_labels(graph, pos)

    # Add edge labels with keys
    if isinstance(graph, MultiGraph):
        edge_labels = {(u, v, k): k for u, v, k in graph.edges(keys=True)}
    else:
        edge_labels = {(u, v): k['key'] for u, v, k in graph.edges(data=True)}

    draw_networkx_edge_labels(graph, pos, edge_labels=edge_labels)

    plt.savefig(os.path.join(path, fName))
    plt.close()

def generate_for_folder_structure(folderPath: str, saveFolder ="CircuitGraphs"):
    """
    :param folderPath: path to the folder to generate for, only generates for files with extension .txt, .sch
    :param saveFolder: name of the folder where the graph.png files are saved. This is created at the same level as the
    source folder lives. Therefore, source folder and save folder cant have the same name.
    :return: None
    :Note:
    The save folder is removed and recreated.
    """
    saveToFolder = os.path.join(os.path.split(folderPath)[0], saveFolder)
    if folderPath == saveToFolder:
        raise ValueError("source and save folder are identical")
        return

    filePaths = []
    for root, dirs, files in walk(folderPath):
        for file in files:
            filePaths.append(f"{root}\\{file}")

    if os.path.isdir(saveToFolder):
        shutil.rmtree(saveToFolder)

    os.mkdir(saveToFolder)
    for filePath in filePaths:
        path, fName = os.path.split(filePath)
        fName, ext = os.path.splitext(fName)
        if not ext in [".txt", ".sch"]:
            continue

        print(filePath)
        savePath = path.replace(folderPath, saveToFolder, 1)

        if not os.path.isdir(savePath):
            os.mkdir(savePath)

        cct = Circuit(os.path.join(path, fName) + ext)
        generate_graph_from_circuit(cct, fName, savePath)

    pass

if __name__ == "__main__":
    netlist = """V1 1 0 dc {10}; down
    W 1 2; right
    C1 2 3 {300}; down
    W 3 5; right
    C2 3 4 {300}; down
    C3 5 6 {150}; down
    W 6 4; left
    W 4 7; left
    W 7 0; up"""
    cct = Circuit("..\\..\\Circuits\\capacitor\\21_cap.txt")
    generate_graph_from_circuit(cct, "test")
    #generateForFolderStructure("..\\..\\Circuits")

