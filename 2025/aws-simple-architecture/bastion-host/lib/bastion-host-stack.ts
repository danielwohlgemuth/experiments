import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class BastionHostStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const bastionHostNACL = new ec2.CfnNetworkAcl(this, 'BastionHostNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'bastion-host-nacl' }]
    });

    new ec2.CfnNetworkAclEntry(this, 'InboundResponse', {
      networkAclId: bastionHostNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'InboundSsh', {
      networkAclId: bastionHostNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 22,
        to: 22,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'OutboundResponse', {
      networkAclId: bastionHostNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'OutboundSsh', {
      networkAclId: bastionHostNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 22,
        to: 22,
      },
    });

    // Associate the NACL to a subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'BastionHostNACLAssociation', {
      subnetId: vpc.publicSubnets[0].subnetId,
      networkAclId: bastionHostNACL.ref,
    });

    const keyPair = ec2.KeyPair.fromKeyPairName(this, 'KeyPair', 'aws-simple-architecture-key-pair');

    // Create a security group for the bastion host
    const bastionHostSecurityGroup = new ec2.SecurityGroup(this, 'BastionHostSecurityGroup', {
      allowAllOutbound: true,
      description: 'Allow all outbound traffic',
      securityGroupName: 'bastion-host-security-group',
      vpc: vpc,
    });

    // Add a rule to allow SSH traffic
    bastionHostSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH traffic',
    );

    // Create a bastion host
    const bastionHost = new ec2.Instance(this, 'BastionHost', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: 'bastion-host',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      keyPair: keyPair,
      sourceDestCheck: false,
      securityGroup: bastionHostSecurityGroup,
      vpc: vpc,
    });

    // Create a security group for the private server
    const privateServerSecurityGroup = new ec2.SecurityGroup(this, 'PrivateServerSecurityGroup', {
      allowAllOutbound: true,
      description: 'Security group for private server',
      securityGroupName: 'private-server-security-group',
      vpc: vpc,
    });

    privateServerSecurityGroup.addIngressRule(
      bastionHostSecurityGroup,
      ec2.Port.tcp(22),
      'Allow SSH traffic from bastion host only',
    );

    // Create a private server
    const privateServer = new ec2.Instance(this, 'PrivateServer', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceName: 'private-server',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      keyPair: keyPair,
      vpc: vpc,
      securityGroup: privateServerSecurityGroup,
    });

    // Output the private server's private IP
    new cdk.CfnOutput(this, 'PrivateServerPrivateIP', {
      value: privateServer.instancePrivateIp,
      description: 'Private IP of the private server',
    });

    // Output the bastion host's public IP
    new cdk.CfnOutput(this, 'BastionHostPublicIP', {
      value: bastionHost.instancePublicIp,
      description: 'Public IP of the bastion host',
    });
  }
}
