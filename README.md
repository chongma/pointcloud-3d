# pointcloud-3d

[![npm version](https://badge.fury.io/js/pointcloud-3d.svg)](https://www.npmjs.com/package/pointcloud-3d)

Reduce 3d point clouds using random subsampling or voxel grid sampling

## Reduce point cloud by subsampling

```javascript
import { reduceSampling } from 'pointcloud-3d'

const data = [
    [0.1, 0.2, 0.3],
    [0.3, 0.2, 0.1],
    [0.2, 0.1, 0.3],
    [0.1, 0.2, 0.3],
    [0.3, 0.2, 0.1],
    [0.2, 0.1, 0.3]
]

const reduced = reduceSampling(data, 3)
```

## Reduce point cloud by voxel grid sampling

```javascript
import { reduceVoxel } from 'pointcloud-3d'

const data = [
    [0.1, 0.2, 0.3],
    [0.3, 0.2, 0.1],
    [0.2, 0.1, 0.3],
    [0.1, 0.2, 0.3],
    [0.3, 0.2, 0.1],
    [0.2, 0.1, 0.3]
]

const reduced = reduceVoxel(data, 0.1)
```
