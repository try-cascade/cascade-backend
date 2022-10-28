import createAlbListener from "../create_alb_listener";

export default function AlbListeners(scope: any, albArn: string, envName: string, albTargetGroups: any) {
  albTargetGroups.forEach((tg: { name: string, arn: string }, idx: number) => {
    const listenerName = `cs-${envName}-alb-listener-${idx}`
    console.log(listenerName, "listenerName")
    createAlbListener(scope, listenerName, albArn, tg.arn)
  })
}