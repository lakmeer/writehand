
import { query, type Document } from 'kdljs'


//
// Base Model Provider
//
// Probably will never be ued directly, just here to define required methods
// and config values for use by Writehand.

export default class ModelProvider {

  #config:    Document             // KDL config
  #key_memo:  Record<string, any>  // caches queries to the KDL config

  system:     string      // The system prompt
  temp:       number      // Model temperature
  max_tokens: number      // Max tokens (in response)
  is_default: boolean     // Is this the default model

  constructor (config:Document) {
    this.#config = config
    this.#key_memo = {}
    this.is_default = false
  }

  get_kdl_key<T> (q:string, multiple:boolean = false):T|undefined {
    if (this.#key_memo[q]) return this.#key_memo[q]
    const hits = query(this.#config, q)
    if (hits.length === 0) return undefined
    this.#key_memo[q] = multiple ? hits[0].values : hits[0].values[0]
    return this.#key_memo[q] as T
  }

  apply_defaults () {
    throw 'ModelProvider: `apply_defaults` not implemented'
  }

  apply_config () {
    throw 'ModelProvider: `apply_config` not implemented'
  }

  enforce_requirements () {
    throw 'ModelProvider: `enforce_requirements` not implemented'
  }

}
