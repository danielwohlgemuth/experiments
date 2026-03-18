# JSON Validator

```bash
go run cmd/jsonvalidator/main.go 1
```

```bash
go build -o json-validator-cli cmd/jsonvalidator/main.go
```

```bash
./json-validator-cli 1
```
```
1 is a valid JSON
```

```bash
go test ./test
```

Add print statements
```bash
sed -i "" -E 's/^(func ([A-Za-z0-9]+)\(state State\) State \{)/\1\n\tfmt.Println("\2", state.Index)/' pkg/jsonvalidator/*.go
```

Remove print statements
```bash
sed -i "" -E '/^\tfmt.Println\("[A-Za-z0-9]+", state.Index\)/d' pkg/jsonvalidator/*.go
```
