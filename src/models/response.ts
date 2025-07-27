export interface IResonse<Data> {
    success: boolean
    message: string
    data: Data
    logs: string[]
  }