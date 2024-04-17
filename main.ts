import { optimisticPipe } from "pipeline";
import { Utils } from "shared/utils";

const doFetch = async ({ 0: url, 1: data }: [string, any]): Promise<any> => {
  const result = url && (await fetch(url).then((res) => res.json()));

  const currentId = parseInt(url.match(/posts\/(\d+)/)?.[1] || "1");
  return [
    Math.random() > 0.5
      ? url.replace(`${currentId}`, `${currentId + 1}`)
      : "obviouslyInvalidUrl",
    {
      ...data,
      [Utils.getRandomHash()]: result,
    },
  ];
};

const run = async () => {
  const result = await optimisticPipe(
    doFetch,
    doFetch,
    doFetch,
    doFetch,
    doFetch,
    doFetch,
    doFetch
  )(["https://jsonplaceholder.typicode.com/posts/1", {}]);

  console.log(result);
};

run();
