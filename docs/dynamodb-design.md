| PK                  | SK_GSI                 | LSI                   | LSI_2 | GSI_SK      | GSI2           | GSI2_SK                 | ...Attributes |
| ------------------- | ---------------------- | --------------------- | ----- | ----------- | -------------- | ----------------------- | ------------- |
| line:{id}           | lineDetails            |                       |       | type:{type} | country:{code} | featureType:line        | ...           |
| spot:{id}           | spotDetails            |                       |       | spot:{id}   | country:{code} | featureType:spot        | ...           |
| guide:{id}          | guideDetails           |                       |       | guide:{id}  | country:{code} | featureType:guide       | ...           |
| feature:{id}:{type} | featureEditor:{userId} | editorReason:{reason} |       | type:{type} |                |                         | ...           |
| feature:{id}:{type} | changelog:{date}       |                       |       |             | country:{code} | featureChangelog:{date} | ...           |
