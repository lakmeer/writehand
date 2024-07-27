
import { query, type Document } from 'kdljs'

import ModelProvider from './base'


//
// Anthropic API Provider
//

export default class Anthropic extends ModelProvider {

  api_base = "https://api.anthropic.com/v1/complete/"

  api_key:    string      // Anthropic API key
  model_name: string      // Which model to tell the API
  top_p?:     number      // Model top_p
  top_k?:     number      // Model top_k

  constructor (config:Document) {
    super(config)

    this.apply_defaults()
    this.apply_config()
    this.enforce_requirements()
  }

  apply_defaults () {
    this.system     = "You are an expert programmer who can help with various coding tasks by providing code diffs from the provided files."
    this.temp       = 1.0
    this.max_tokens = 1024
  }

  apply_config () {
    this.system     = this.get_kdl_key<string>('Model system')              || this.system
    this.api_key    = this.get_kdl_key<string>('Model provider key')        || this.api_key
    this.model_name = this.get_kdl_key<string>('Model provider model_name') || this.model_name
    this.max_tokens = this.get_kdl_key<number>('Model max_tokens')          || this.max_tokens
    this.temp       = this.get_kdl_key<number>('Model temp')                || this.temp
    this.top_p      = this.get_kdl_key<number>('Model top_p')
    this.top_k      = this.get_kdl_key<number>('Model top_p')
  }

  enforce_requirements () {
    if (!this.api_key)    throw 'Provider Anthropic: API key (provider->key) not specified'
    if (!this.model_name) throw 'Provider Anthropic: Model name (provider->model_name) not specified'
  }

}

