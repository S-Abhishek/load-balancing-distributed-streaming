from mpi4py import MPI
import psutil as ps
import os
import socket
import math
import time
import json

ts = []

def gatherLoad(threshold_data, grades):
    send_grade = 0
    if rank > 0:

        # Retrive usage data
        cpu_occ_rate = ps.cpu_percent(interval = 1 )/100
        disk_occ_rate = ps.disk_usage(os.getcwd()).percent/100
        mem_occ_rate = ps.virtual_memory().percent/100
        I_s = math.sqrt( (disk_occ_rate**2 + mem_occ_rate**2 + cpu_occ_rate**2)/3 )
        
        # Check if any of the h/w usages cross the threshold
        if cpu_occ_rate >= threshold_data["thresholds"][0] or \
        disk_occ_rate >= threshold_data["thresholds"][1] or \
        mem_occ_rate >= threshold_data["thresholds"][2]:
           send_grade = threshold_data["grade_s"]
           print("H/W threshold reached or exceeded")
        else:
        # Calculate the grade of the load
            calc_val = 10*I_s
            send_grade = grades[0]
            for i in range(len(grades) - 1):
                if calc_val >= grades[i] and calc_val < grades[i+1]:
                    send_grade = grades[i]
        print(f"Sending grade {send_grade} to master")
    comm.barrier()
    
    return comm.gather(send_grade, root = 0)

# Calculate the grade levels using grade_S
def calcGrades(grade_s):
    grades = [0,0,0,0,0,0]
    grades[0] = grade_s/2
    grades[2] = (grades[0] + grade_s)/2
    grades[1] = (grades[0] + grades[2])/2
    grades[3] = (grades[2] + grade_s)/2
    grades[4] = grade_s
    grades[5] = 50 
    
    return grades


comm = MPI.COMM_WORLD
rank = comm.Get_rank()
hosts = []
if rank == 0:
    # bind to the socket
    server_address = "/tmp/loads"
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        sock.connect(server_address)
    except socket.error:
        print(socket.error)

    # read the threshold file in master
    with open("threshold_info.json") as data_file:
        threshold_info = json.load(data_file)
        ts = [threshold_info.get(i) for i in threshold_info]
    
    # read the machinefile to find which id belongs to which ranked node in MPI Cluster
    with open('mfile') as host_file:
        hosts = host_file.read().split("\n")
    
    print(f"Regional Server addresses {hosts}")

# Scatter the threshold data from master
comm.barrier()
threshold_data = comm.scatter(ts, root = 0)

grades = []
if rank>0:
    print(f"{rank} recieved {threshold_data}")
    grades = calcGrades(threshold_data["grade_s"])
    print(f"Calculated grades = {grades}")

while True:

    # Gather the load data to master
    load_data = gatherLoad(threshold_data, grades)
    # Send threshold data to central server
    if rank == 0:
        send_data = {}
        for idx,val in enumerate(hosts):
            send_data[val] = load_data[idx]
        print("ldata",load_data)
        sock.send(json.dumps(send_data).encode())
    time.sleep(20)
