# Built-in HTTP exceptions
下面是这些 NestJS HTTP 异常及其适用的情况：

- BadRequestException：请求不符合服务器的要求，例如参数验证失败或格式错误。

- UnauthorizedException：请求未经授权，通常在请求中缺少或无效的身份验证凭据时抛出。

- NotFoundException：服务器找不到请求的资源。例如，用户请求了不存在的API路径或资源。

- ForbiddenException：请求被理解，但服务器拒绝执行它。这通常发生在用户没有足够权限时。

- NotAcceptableException：服务器无法生成符合请求的 Accept 头部中指定的内容特性的响应。

- RequestTimeoutException：服务器在等待请求完成时超时。通常适用于长时间未响应的请求。

- ConflictException：请求无法处理，因为它会导致服务器的资源状态冲突，通常发生在数据库操作引起的冲突时。

- GoneException：请求的资源不再可用，并且没有已知的地址。这种情况下，资源可能已经永久删除。

- HttpVersionNotSupportedException：服务器不支持请求中使用的 HTTP 版本。

- PayloadTooLargeException：请求负载（即请求体）大于服务器愿意或能够处理的限制。

- UnsupportedMediaTypeException：服务器不支持请求中的媒体类型。例如，用户上传了服务器不接受的文件类型。

- UnprocessableEntityException：请求格式正确，但由于语义错误无法处理。例如，提交了不符合业务规则的数据。

- InternalServerErrorException：服务器内部错误，无法处理请求。这通常表示服务器遇到了意外情况。

- NotImplementedException：服务器不支持请求的功能。例如，某个API尚未实现。

- ImATeapotException：这是一个愚人节彩蛋，代表HTTP 418状态码，通常不会在实际应用中使用。

- MethodNotAllowedException：请求的方法（GET, POST, 等）在目标资源上不被允许。

- BadGatewayException：服务器作为网关或代理，从上游服务器接收到无效的响应。

- ServiceUnavailableException：服务器当前无法处理请求，通常是由于服务器过载或维护。

- GatewayTimeoutException：服务器作为网关或代理时，从上游服务器未能及时收到响应。

- PreconditionFailedException：请求中的某个条件在服务器上未能满足。例如，HTTP头部中的 If-Match 条件不满足。