import { RETRY_DELAY } from '../utils/const'
import { delay, retryWhen } from 'rxjs/operators'

export default status$ => status$.pipe(retryWhen(delay(RETRY_DELAY)))
