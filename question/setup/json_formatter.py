import json
import time


with open('result.json') as f:
    data = json.load(f)

result = {
    "stats" : {
        "suites" : 0,
        "tests" : 0,
        "passes" : 0,
        "pending" : 0,
        "failures" : 0,
        "start" : 0,
        "end" : 0,
        "duration" : 0
    },
    "tests" : [],
    "pending" : [],
    "failures" : [],
    "passes" : []
}

tmp = 0
noOfTest = 0
noOfPasses = 0
noOfFailures = 0
result['stats']['start'] = round(time.time(),2)

for suite in data:
    tmp +=1
    for spec in data[suite]['specs']:
        test = {
            "title" : "",
            "fullTitle" : "",
            "err" : {}
        }
        noOfTest += 1
        test["title"] = spec['description']
        test['fullTitle'] = spec['fullName']
        test['err'] = spec['failedExpectations']
        result['tests'].append(test)
        if spec['status'] == "failed":
            result['failures'].append(test)
            noOfFailures += 1

        if spec['status'] == "passed":
            result['passes'].append(test)
            noOfPasses += 1
result['stats']['end'] = round(time.time(),2)
result['stats']['suites'] = tmp
result['stats']['tests'] = noOfTest
result['stats']['passes'] = noOfPasses
result['stats']['failures'] = noOfFailures
result['stats']['duration'] = result['stats']['end'] - result['stats']['start']

with open('result.json', 'w') as outfile:
    json.dump(result, outfile)


