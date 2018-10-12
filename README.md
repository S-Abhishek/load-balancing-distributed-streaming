# load-balancing-distributed-streaming
Load balancing a distributed system for effective streaming

This project is to implement an effective way of streaming content using regional servers.Each regional server has a specific threshold.
When this threshold value increases,It updates the value to the central server.
The central server chooses the most effective slave server for streaming content to the client who requested it.
