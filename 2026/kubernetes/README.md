


When in doubt, use kubectl describe to see how Kubernetes has interpreted the request.


minikube start
minikube dashboard
minikube service <service-name>
minikube addons list
minikube addons enable <addon-name>

kubectl get deployments | deploy
kubectl get pods | po
kubectl get pods -l <label> -o wide --selector=<selector>
kubectl get events
kubectl logs <pod-name> --follow
kubectl get services | svc
kubectl get services -l <label>
kubectl get replicasets | rs
kubectl get nodes
kubectl get --raw /metrics
kubectl get --raw /api/v1/nodes/<node-name>/proxy/metrics
kubectl get namespaces | ns

kubectl delete service <service-name>
kubectl delete service -l <label>
kubectl delete deployment <deployment-name>

kubectl proxy

kubectl exec <pod-name> -- <app-name>
kubectl exec -ti <pod-name> -- bash

kubectl label pods <pod-name> <label-key>=<label-value>

kubectl scale <deployment-name> --replicas=<replicas-number>

kubectl describe <object>

kubectl set image <object> <container-name>=<image-url>

kubectl rollout restart <deployment-name>
kubectl rollout status <deployment-name> --watch=true
kubectl rollout undo <deployment-name>

kubectl create configmap <configmap-name> --from-literal=<key>=<value>

kubectl apply -f <file-path>

kubectl edit <object>

kubectl cluster-info

kubectl label --dry-run=server --overwrite ns --all pod-security.kubernetes.io/enforce=privileged
kubectl label --dry-run=server --overwrite ns --all pod-security.kubernetes.io/enforce=baseline
kubectl label --dry-run=server --overwrite ns --all pod-security.kubernetes.io/enforce=restricted
kubectl label --overwrite ns example pod-security.kubernetes.io/warn=baseline pod-security.kubernetes.io/warn-version=latest

