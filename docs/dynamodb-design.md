| PK                  | SK_GSI             | LSI | LSI_2 | GSI_SK              | GSI2           | GSI2_SK              | ...Attributes |
| ------------------- | ------------------ | --- | ----- | ------------------- | -------------- | -------------------- | ------------- |
| line:{id}           | lineDetails        |     |       | type:{type}         | country:{code} | featureType:line     | ...           |
| line:{id}           | lineUpdate:{date}  |     |       |                     | country:{code} | featureUpdate:{date} | ...           |
| spot:{id}           | spotDetails        |     |       | spot:{id}           | country:{code} | featureType:spot     | ...           |
| spot:{id}           | spotUpdate:{date}  |     |       |                     | country:{code} | featureUpdate:{date} | ...           |
| guide:{id}          | guideDetails       |     |       | guide:{id}          | country:{code} | featureType:guide    | ...           |
| guide:{id}          | guideUpdate:{date} |     |       |                     | country:{code} | featureUpdate:{date} | ...           |
| feature:{featureId} | editor:{id}        |     |       | identityType:{type} |                |                      | ...           |
