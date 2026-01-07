export default function promiseWrapper(
  asyncFn: (req: any, res: any, next: any) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(asyncFn(req, res, next)).catch((err) => next(err));
  };
}
