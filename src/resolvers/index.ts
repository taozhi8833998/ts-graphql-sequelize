import { fileLoader, mergeResolvers } from 'merge-graphql-schemas'
import * as path from 'path'

const resolversArray = fileLoader(path.join(__dirname, '*.resolver.js'))
export default mergeResolvers(resolversArray)
