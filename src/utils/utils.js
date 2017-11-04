class utilities {

  pathExplode (path) {
    var explodedPath = path.pathname.split( '/' );
    return explodedPath
  }

  pathLast (path) {
    return path.pathname.split( '/' ).pop();
  }
}

  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  // if (process.env.NODE_ENV !== 'production') {
  //   logger.add(new winston.transports.Console({
  //     format: winston.format.simple()
  //   }));
  // }
  var utils = new utilities();
  export default utils;