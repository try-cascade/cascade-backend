// export default function createAlbTargetGroups(scope: any, name: string, vpcId: string, containerArr: any) {

//   const serviceTargetGroups = containerArr.map(cont => {
//     return createAlbTargetGroup(this, `cs-${envName}-${cont.name}-target-group`, vpcId)
//   });

//   return serviceTargetGroups
// }

// const serviceTargetGroups = dummyServiceObj.containers.map(cont => {
//   return createAlbTargetGroup(this, `cs-${envName}-${cont.name}-target-group`, vpcId)
// });

// serviceTargetGroups.forEach(stg => {
//   createAlbListener(this, `cs-${envName}-alb-listener`, appLoadBalancer.arn, stg.arn);
// }) 

// for the name, how can we use container.name interpolated with `envName` to make a unique?