import * as borsh from 'borsh';
import bs58 from 'bs58';

export const deserializeToken = (data) =>{
const schema = { 'struct': { 
        'discriminator': 'u64', 
        'name': "string", 
        'symbol': 'string', 
        'uri': 'string', 
  } };
  const encodeddata = data
  
  const decoded = borsh.deserialize(schema, Buffer.from(bs58.decode(encodeddata)));
  return decoded
}