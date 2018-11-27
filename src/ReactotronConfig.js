import { reactotronRedux } from 'reactotron-redux'
import Reactotron from 'reactotron-react-js'

const reactotron = Reactotron.configure({ name: 'React Native Demo' })
  .use(reactotronRedux()) //  <- here i am!
  .connect() //Don't forget about me!

export default reactotron
