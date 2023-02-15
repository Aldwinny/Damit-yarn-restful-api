# Damit Yarn! Backend 👚

The Damit Yarn! Express RESTful API is an API used for the Damit Yarn! React Native Mobile Application.

## 📖 API Reference 📖

⚠️ To be Implemented.

### Test call 📢

```http
  GET /api
```

#### ✅ Returns a status of 405 and a message of "To be Implemented."

## ✨ Author ✨

- [@Aldwinny](https://www.github.com/aldwinny)

&nbsp;

### 🔵 Unimplemented Stuff (Mostly used for README Reference)

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.
