HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 2
ETag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
Date: Mon, 23 Feb 2026 15:10:35 GMT
Connection: close

[]


HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 34
ETag: W/"22-PO0iYfCiXV7p/POMq6CNOvBMTwY"
Date: Mon, 23 Feb 2026 15:11:09 GMT
Connection: close

{
  "numero_compte": "COOP-2026-0001"
}

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 16
ETag: W/"10-0UPgAAWCfq1jH18/CPcRCBXPkKM"
Date: Mon, 23 Feb 2026 15:11:33 GMT
Connection: close

{
  "nextNumber": 1
}

HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 515
ETag: W/"203-89L8OU0JjJNCF0FK4kQUY3cbJgA"
Date: Mon, 23 Feb 2026 15:11:47 GMT
Connection: close

{
  "id": 2,
  "numeroCompte": "M-2024-001",
  "nomComplet": "Jean Dupont",
  "dateAdhesion": "2024-02-23T00:00:00.000Z",
  "telephone": "+243810000000",
  "email": "jean.dupont@example.com",
  "adresse": "Lubumbashi, Gecamines",
  "sexe": "M",
  "typeCompte": "Epargne",
  "statut": "actif",
  "photoProfil": null,
  "userId": "jdupont",
  "motDePasse": "$2b$10$tWBI/vDf769E1b4XqAfBhOeWKa/EpDsID6fpTblE/DS9Vug6n7YIq",
  "dateNaissance": "1990-01-01T00:00:00.000Z",
  "idNationale": "ID123456789",
  "createdAt": "2026-02-23T15:11:47.209Z",
  "updatedAt": "2026-02-23T15:11:47.209Z"
}

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 32
ETag: W/"20-Q0ik5nWetlwwdnIV4Noq+oBeKF8"
Date: Mon, 23 Feb 2026 15:12:01 GMT
Connection: close

{
  "exists": true,
  "where": "membre"
}

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 2
ETag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
Date: Mon, 23 Feb 2026 15:12:14 GMT
Connection: close

[] 


HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 197
ETag: W/"c5-ICCKG+rVc+GZi5Gw3uUjLYuu/Lg"
Date: Mon, 23 Feb 2026 15:14:15 GMT
Connection: close

{
  "id": 1,
  "compte": "M-2024-001",
  "typeOperation": "depot",
  "devise": "USD",
  "montant": 100,
  "dateOperation": "2024-02-23T12:00:00.000Z",
  "description": "Premier dépôt",
  "createdAt": "2026-02-23T15:14:15.025Z"
}