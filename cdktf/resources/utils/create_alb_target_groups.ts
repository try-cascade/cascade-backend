import createAlbTargetGroup from "../create_alb_target_group";

export default function createAlbTargetGroups(scope: any, vpcId :string, envName: string, containers: any) {
  return containers.map((container: { name: string; }) => {
    return createAlbTargetGroup(scope, `cs-${envName}-${container.name}-target-group`, vpcId)
  });
}


// export default function createAlbTargetGroups(scope: any, name: string, vpcId: string, containerArr: any) {

//   const serviceTargetGroups = containerArr.map(cont => {
//     const currentContainerTG = createAlbTargetGroup(this, `cs-${envName}-${cont.name}-target-group`, vpcId)

//     createAlbListener(this, `cs-${envName}-alb-listener`, appLoadBalancer.arn, currentContainerTG.arn);

//     return currentContainerTG
//   });

//   return serviceTargetGroups
// }

// createAlbTargetGroups
// - input: this, vpcId, envName, containers
// - output: an array of target groups
// - side effect: invoke createAlbTargetGroup


// createAlbListeners
// - input: this, lbArn, targetGroups
// - output: none?
// - side effect: invoke createAlbListener





// const serviceTargetGroups = dummyServiceObj.containers.map(cont => {
//   return createAlbTargetGroup(this, `cs-${envName}-${cont.name}-target-group`, vpcId)
// });

// serviceTargetGroups.forEach(stg => {
//   createAlbListener(this, `cs-${envName}-alb-listener`, appLoadBalancer.arn, stg.arn);
// }) 

// for the name, how can we use container.name interpolated with `envName` to make a unique?