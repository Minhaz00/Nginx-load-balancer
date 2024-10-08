
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

// Create a VPC
const vpc = new aws.ec2.Vpc("my-vpc", {
    cidrBlock: "10.0.0.0/16",
    tags: {
        Name: "my-vpc"
    }
});

exports.vpcId = vpc.id;

// Create a public subnet
const publicSubnet = new aws.ec2.Subnet("public-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "ap-southeast-1a",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "public-subnet"
    }
});

exports.publicSubnetId = publicSubnet.id;

// Create an Internet Gateway
const igw = new aws.ec2.InternetGateway("internet-gateway", {
    vpcId: vpc.id,
    tags: {
        Name: "igw"
    }
});

exports.igwId = igw.id;

// Create a route table
const publicRouteTable = new aws.ec2.RouteTable("public-route-table", {
    vpcId: vpc.id,
    tags: {
        Name: "rt-public"
    }
});

// Create a route in the route table for the Internet Gateway
const route = new aws.ec2.Route("igw-route", {
    routeTableId: publicRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: igw.id
});

// Associate the route table with the public subnet
const routeTableAssociation = new aws.ec2.RouteTableAssociation("public-route-table-association", {
    subnetId: publicSubnet.id,
    routeTableId: publicRouteTable.id
});

exports.publicRouteTableId = publicRouteTable.id;


// Create a security group for the public instance
const publicSecurityGroup = new aws.ec2.SecurityGroup("public-secgrp", {
    vpcId: vpc.id,
    description: "Enable HTTP and SSH access for public instance",
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] }
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }
    ]
});

// Use the specified Ubuntu 24.04 LTS AMI
const amiId = "ami-060e277c0d4cce553";

// Create an EC2 instance in the public subnet
const nginxInstance = new aws.ec2.Instance("nginx-instance", {
    instanceType: "t2.micro",
    vpcSecurityGroupIds: [publicSecurityGroup.id],
    ami: amiId,
    subnetId: publicSubnet.id,
    keyName: "MyKeyPair",
    associatePublicIpAddress: true,
    tags: {
        Name: "nginx-lb"
    }
});

exports.publicInstanceId = nginxInstance.id;
exports.publicInstanceIp = nginxInstance.publicIp;


const masterInstance = new aws.ec2.Instance("master-instance", {
    instanceType: "t2.micro",
    vpcSecurityGroupIds: [publicSecurityGroup.id],
    ami: amiId,
    subnetId: publicSubnet.id,
    keyName: "MyKeyPair",
    associatePublicIpAddress: true,
    tags: {
        Name: "master"
    }
});

exports.publicInstanceId = masterInstance.id;
exports.publicInstanceIp = masterInstance.publicIp;


const worker1Instance = new aws.ec2.Instance("worker1-instance", {
    instanceType: "t2.micro",
    vpcSecurityGroupIds: [publicSecurityGroup.id],
    ami: amiId,
    subnetId: publicSubnet.id,
    keyName: "MyKeyPair",
    associatePublicIpAddress: true,
    tags: {
        Name: "worker1"
    }
});

exports.publicInstanceId = worker1Instance.id;
exports.publicInstanceIp = worker1Instance.publicIp;

