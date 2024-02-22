export const GetResutlsByQUery = (query: string) => {
  return `
    {
        "context": {
            "page": {
                "uri": "/"
            },
            "locale": {
                "country": "us",
                "language": "en"
            }
        },
        "widget": {
            "items": [
                {
                    "entity": "content",
                    "rfk_id": "rfkid_7",
                    "search": {
                        "content": {},
                        "query": {
                            "keyphrase": "${query}"
                        }
                    }
                }
            ]
        }
    }
    `;
};
