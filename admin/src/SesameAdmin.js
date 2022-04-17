// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { S3 } from "@aws-sdk/client-s3";
import { v4 as uuid } from 'uuid';
import { createS3Data } from "@astral-atlas/sesame-data";
import { createLoginProof, encodeProofToken } from "@astral-atlas/sesame-models";
import { h, useEffect, useState } from '@lukekaalim/act';


import './index.css';

export const SesameAdmin/*: Component<>*/ = () => {
  const [bucketName, setBucketName] = useState('sesame-test-data20210930112954914600000001');
  const [bucketPrefix, setBucketPrefix] = useState('/')
  const [credentials, setCredentials] = useState({
    
  })
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const s3 = new S3({
      region: 'ap-southeast-2',
      credentials,
    });
    const { data } = createS3Data(s3, bucketName, bucketPrefix);
    setData(data);
  }, [bucketName, bucketPrefix])

  const onBucketNameChange = (event) => {
    setBucketName(event.target.value);
  }
  const onBucketPrefixChange = (event) => {
    setBucketPrefix(event.target.value);
  }

  const [users, setUsers] = useState([])


  useEffect(() => {
    if (!data)
      return;
    data.users.scan()
      .then(users => setUsers(users.result))
      .catch(error => console.error(error))
  }, [data])

  return [
    h('h1', {}, 'Sesame Admin'),

    h('form', {}, [
      h('label', {}, [
        h('span', {}, 'Bucket Name'),
        h('input', { onChange: onBucketNameChange, value: bucketName, type: 'text' })
      ]),
      h('label', {}, [
        h('span', {}, 'Bucket Prefix'),
        h('input', { onChange: onBucketPrefixChange, value: bucketPrefix, type: 'text' })
      ]),
    ]),

    data && h(UserCredentialGenerator, { users, data }),


    h('table', { classList: ['userTable'] }, [
      h('thead', {}, [
        h('tr', {}, [
          h('th', {}, 'UserID'),
          h('th', {}, 'Name'),
          h('th', {}, 'CreatedBy'),
        ]),
      ]),
      users.map(user => [
        h('tr', {}, [
          h('td', {}, user.id),
          h('td', {}, user.name),
          h('td', {}, user.creatorAdminId),
        ])
      ])
    ])
  ]
}

const base64abc = [
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
	"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];
function bytesToBase64(bytes) {
	let result = '', i, l = bytes.length;
	for (i = 2; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}

const UserCredentialGenerator = ({ users, data }) => {
  const [userId, setUserId] = useState(null)
  const [loginURL, setLoginURL] = useState(null)

  const onUserChange = (event) => {
    setUserId(event.target.value);
  };
  const onSubmitGenerateLoginURL = async (event) => {
    event.preventDefault();
    
    if (!userId)
      return;
    
    const grant = {
      type: 'login',
      createdIdentity: null,
      revoked: false,
      createdBy: null,
      login: userId,
      id: uuid()
    };
    const secretBytes = crypto.getRandomValues(new Uint8Array(128))
    const secret = bytesToBase64(secretBytes);
    await data.grants.login.set(userId, grant.id, grant)
    await data.secrets.set(grant.id, secret);
  
    const proof = createLoginProof(grant, secret);
    const token = encodeProofToken(proof);

    const loginUrl = new URL('/', 'http://localhost:8080');
    loginUrl.searchParams.append('token', token);
    setLoginURL(loginUrl)
  }

  return [
    h('form', { onSubmit: onSubmitGenerateLoginURL }, [
      h('label', {}, [
        h('span', {}, 'User'),
        h('select', { onChange: onUserChange }, [
          users.map(user => [
            h('option', { selected: userId === user.id, value: user.id }, user.name)
          ])
        ])
      ]),
      h('input', { type: 'submit', value: 'Generate Login URL' })
    ]),
    loginURL && h('pre', {}, loginURL.href)
  ]
}