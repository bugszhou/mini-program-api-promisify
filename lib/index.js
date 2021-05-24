import { promisifyAll } from "./promise";

const mini = {};

promisifyAll(wx, mini);

export default mini;
