const errorMsg = (error: string): string => {
  return error.charAt(0).toUpperCase() + error.slice(1);
};
export default errorMsg;
