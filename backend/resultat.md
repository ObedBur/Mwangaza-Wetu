HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 2
ETag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
Date: Wed, 25 Feb 2026 14:48:35 GMT
Connection: close

[]

,

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 74
ETag: W/"4a-SvEb6xUBeUjQTkzFpZJ7dw5e5Cs"
Date: Wed, 25 Feb 2026 14:49:03 GMT
Connection: close

{
  "total": 0,
  "actifs": 0,
  "inactifs": 0,
  "hommes": 0,
  "femmes": 0,
  "typeComptes": []
} ,

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 36
ETag: W/"24-sQsralk/UZqdMsBqRFBTH+myDxo"
Date: Wed, 25 Feb 2026 14:49:22 GMT
Connection: close

{
  "numero_compte": "COOP-E-2026-0001"
} ,

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 16
ETag: W/"10-0UPgAAWCfq1jH18/CPcRCBXPkKM"
Date: Wed, 25 Feb 2026 14:50:32 GMT
Connection: close

{
  "nextNumber": 1
} 

HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 555
ETag: W/"22b-0zjnm2T3JzopGjqfK3ToS6AW0uo"
Date: Wed, 25 Feb 2026 14:50:53 GMT
Connection: close

{
  "id": 2,
  "numeroCompte": "COOP-E-2026-TEST-1772031052",
  "nomComplet": "Jean Mutombo Test",
  "dateAdhesion": "2026-02-25T14:50:52.783Z",
  "telephone": "0991234567",
  "email": "jean.test.1772031052@mwangaza.cd",
  "adresse": "Avenue Bukavu, Goma",
  "sexe": "M",
  "typeCompte": "Epargne",
  "statut": "actif",
  "photoProfil": null,
  "userId": "test-1772031052",
  "motDePasse": "$2b$10$4ZXDzSDvAGqFC4/w4MUCBeMLct.brukQvptV3LL.KufJI3VzPiBfW",
  "dateNaissance": "1990-05-15T00:00:00.000Z",
  "idNationale": "CD-NK-1772031052",
  "createdAt": "2026-02-25T14:50:53.044Z",
  "updatedAt": "2026-02-25T14:50:53.044Z"
}

HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 82
ETag: W/"52-ZZqxV9YEzKMSc/e77k6mDb48z3s"
Date: Wed, 25 Feb 2026 14:51:25 GMT
Connection: close

{
  "message": "Code de confirmation invalide",
  "error": "Bad Request",
  "statusCode": 400
} 

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 29
ETag: W/"1d-kRBz/8BemPtBoSvqmqwYskJYLzc"
Date: Wed, 25 Feb 2026 14:51:38 GMT
Connection: close

{
  "exists": false,
  "where": null
} 

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 175
ETag: W/"af-4OA+1U5Pau5pKQMdf6YO0TWsx74"
Date: Wed, 25 Feb 2026 14:51:53 GMT
Connection: close

[
  {
    "id": 1,
    "numero_compte": "COOP-E-2026-0000",
    "nom_complet": "Compte Collectif EPARGNE"
  },
  {
    "id": 2,
    "numero_compte": "COOP-E-2026-TEST-1772031052",
    "nom_complet": "Jean Mutombo Test"
  }
] 

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 163
ETag: W/"a3-QCSoaw4ALDZxqt66v0k/kyE7iw8"
Date: Wed, 25 Feb 2026 14:52:06 GMT
Connection: close

{
  "total": 2,
  "actifs": 2,
  "inactifs": 0,
  "hommes": 1,
  "femmes": 0,
  "typeComptes": [
    {
      "_count": {
        "_all": 1
      },
      "typeCompte": "Epargne"
    },
    {
      "_count": {
        "_all": 1
      },
      "typeCompte": "EPARGNE"
    }
  ]
} 

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 427
ETag: W/"1ab-lDGebmP1GxjnVVI1Ect/yya4Cog"
Date: Wed, 25 Feb 2026 14:52:18 GMT
Connection: close

{
  "id": 1,
  "numeroCompte": "COOP-E-2026-0000",
  "nomComplet": "Compte Collectif EPARGNE",
  "dateAdhesion": "2026-02-25T14:50:52.878Z",
  "telephone": "0998877665",
  "email": null,
  "adresse": "Avenue des Volcans, Goma",
  "sexe": null,
  "typeCompte": "EPARGNE",
  "statut": "actif",
  "photoProfil": null,
  "userId": null,
  "motDePasse": "collectif",
  "dateNaissance": null,
  "idNationale": null,
  "createdAt": "2026-02-25T14:50:52.879Z",
  "updatedAt": "2026-02-25T14:52:18.831Z"
}

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 52
ETag: W/"34-zNBqcqs1Xej/7deHvoDxlqA441w"
Date: Wed, 25 Feb 2026 14:52:41 GMT
Connection: close

{
  "success": false,
  "message": "Délégué non trouvé"
}

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 427
ETag: W/"1ab-lDGebmP1GxjnVVI1Ect/yya4Cog"
Date: Wed, 25 Feb 2026 14:52:54 GMT
Connection: close

{
  "id": 1,
  "numeroCompte": "COOP-E-2026-0000",
  "nomComplet": "Compte Collectif EPARGNE",
  "dateAdhesion": "2026-02-25T14:50:52.878Z",
  "telephone": "0998877665",
  "email": null,
  "adresse": "Avenue des Volcans, Goma",
  "sexe": null,
  "typeCompte": "EPARGNE",
  "statut": "actif",
  "photoProfil": null,
  "userId": null,
  "motDePasse": "collectif",
  "dateNaissance": null,
  "idNationale": null,
  "createdAt": "2026-02-25T14:50:52.879Z",
  "updatedAt": "2026-02-25T14:52:18.831Z"
}