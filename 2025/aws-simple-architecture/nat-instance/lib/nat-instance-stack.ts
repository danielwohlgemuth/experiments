import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NatInstanceStack extends cdk.Stack {
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

    // Create Network ACL for public subnet (NAT instance)
    const publicNatNACL = new ec2.CfnNetworkAcl(this, 'PublicNatNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'public-nat-nacl' }]
    });

    // Inbound rules for public NAT instance
    new ec2.CfnNetworkAclEntry(this, 'PublicInboundResponse', {
      networkAclId: publicNatNACL.ref,
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

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundHttp', {
      networkAclId: publicNatNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: vpc.isolatedSubnets[0].ipv4CidrBlock,
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundHttps', {
      networkAclId: publicNatNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: vpc.isolatedSubnets[0].ipv4CidrBlock,
      portRange: {
        from: 443,
        to: 443,
      },
    });

    // Outbound rules for public NAT instance
    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundResponse', {
      networkAclId: publicNatNACL.ref,
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

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundHttp', {
      networkAclId: publicNatNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundHttps', {
      networkAclId: publicNatNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    // Associate the NACL to the public subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'PublicNatNACLAssociation', {
      subnetId: vpc.publicSubnets[0].subnetId,
      networkAclId: publicNatNACL.ref,
    });

    // Create Network ACL for private subnet
    const privateInstanceNACL = new ec2.CfnNetworkAcl(this, 'PrivateInstanceNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'private-instance-nacl' }]
    });

    // Inbound rules for private instance
    new ec2.CfnNetworkAclEntry(this, 'PrivateInboundResponse', {
      networkAclId: privateInstanceNACL.ref,
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

    // Outbound rules for private instance
    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundResponse', {
      networkAclId: privateInstanceNACL.ref,
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

    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundHttp', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      // cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundHttps', {
      networkAclId: privateInstanceNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      // cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    // Associate the NACL to the private subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'PrivateInstanceNACLAssociation', {
      subnetId: vpc.isolatedSubnets[0].subnetId,
      networkAclId: privateInstanceNACL.ref,
    });

    // const keyPair = ec2.KeyPair.fromKeyPairName(this, 'KeyPair', 'aws-simple-architecture-key-pair');

    // Create a security group for the public NAT instance
    const publicNatSecurityGroup = new ec2.SecurityGroup(this, 'PublicNatSecurityGroup', {
      allowAllOutbound: true,
      description: 'Security group for public NAT instance',
      securityGroupName: 'public-nat-security-group',
      vpc: vpc,
    });

    // Allow HTTP, HTTPS, and SSH traffic from private instance
    publicNatSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.isolatedSubnets[0].ipv4CidrBlock),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from private instance',
    );
    publicNatSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.isolatedSubnets[0].ipv4CidrBlock),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from private instance',
    );
    // // Allow SSH from anywhere to public NAT instance
    // publicNatSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(22),
    //   'Allow SSH from anywhere',
    // );

    // User data script for the public NAT instance
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'sudo yum install iptables-services -y',
      'sudo systemctl enable iptables',
      'sudo systemctl start iptables',
      'echo "net.ipv4.ip_forward=1" | sudo tee --append /etc/sysctl.d/custom-ip-forwarding.conf',
      'sudo sysctl -p /etc/sysctl.d/custom-ip-forwarding.conf',
      'sudo /sbin/iptables -t nat -A POSTROUTING -o enX0 -j MASQUERADE', // Use "netstat -i" to the name of the interface (enX0 in this case)
      'sudo /sbin/iptables -F FORWARD',
      'sudo service iptables save'
    );
    // Add router config to public instance user data to allow SSH forwarding
    // userData.addCommands(
    //   'echo "AllowTcpForwarding yes" | sudo tee -a /etc/ssh/sshd_config',
    //   'sudo systemctl restart sshd'
    // );

    // Create the public NAT instance
    const publicNatInstance = new ec2.Instance(this, 'PublicNatInstance', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: 'public-nat-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      // keyPair: keyPair,
      sourceDestCheck: false, // Disable source/destination check for NAT functionality
      securityGroup: publicNatSecurityGroup,
      vpc: vpc,
      userData: userData,
    });

    // Route table for private subnet to route internet traffic through NAT instance
    const privateRouteTable = new ec2.CfnRouteTable(this, 'PrivateRouteTable', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'private-instance-rt' }],
    });

    // Route 0.0.0.0/0 to the NAT instance
    new ec2.CfnRoute(this, 'PrivateSubnetDefaultRoute', {
      routeTableId: privateRouteTable.ref,
      destinationCidrBlock: '0.0.0.0/0',
      instanceId: publicNatInstance.instanceId,
    });

    // Associate the route table with the private (isolated) subnet
    new ec2.CfnSubnetRouteTableAssociation(this, 'PrivateSubnetRouteTableAssociation', {
      subnetId: vpc.isolatedSubnets[0].subnetId,
      routeTableId: privateRouteTable.ref,
    });

    // Create a security group for the private instance
    const privateInstanceSecurityGroup = new ec2.SecurityGroup(this, 'PrivateInstanceSecurityGroup', {
      allowAllOutbound: false,
      description: 'Security group for private instance',
      securityGroupName: 'private-instance-security-group',
      vpc: vpc,
    });

    // Allow HTTP, HTTPS, and SSH outbound traffic to the public NAT instance
    privateInstanceSecurityGroup.addEgressRule(
      publicNatSecurityGroup,
      ec2.Port.tcp(80),
      'Allow HTTP traffic to public NAT instance',
    );
    privateInstanceSecurityGroup.addEgressRule(
      publicNatSecurityGroup,
      ec2.Port.tcp(443),
      'Allow HTTPS traffic to public NAT instance',
    );
    // // Allow SSH from public NAT instance to private instance
    // privateInstanceSecurityGroup.addIngressRule(
    //   publicNatSecurityGroup,
    //   ec2.Port.tcp(22),
    //   'Allow SSH from public NAT instance',
    // );
    // privateInstanceSecurityGroup.addEgressRule(
    //   publicNatSecurityGroup,
    //   ec2.Port.tcp(22),
    //   'Allow SSH to public NAT instance',
    // );

    // CloudFormation parameters for URL and sleep time
    const urlParam = new cdk.CfnParameter(this, 'WebsocketCounterUrl', {
      type: 'String',
      default: 'https://websocket-counter.daniel-wohlgemuth.workers.dev/api/update?text=',
      description: 'The URL to call from the private instance script.'
    });
    const sleepParam = new cdk.CfnParameter(this, 'WebsocketCounterSleep', {
      type: 'Number',
      default: 3,
      description: 'The sleep interval (in seconds) between calls.'
    });

    // User data script for the private instance
    const privateInstanceUserData = ec2.UserData.forLinux();
    privateInstanceUserData.addCommands(
      '#!/bin/bash',
      'yum install -y curl',
      `URL="${urlParam.valueAsString}"`,
      `SLEEP=${sleepParam.valueAsNumber}`,
      'cat > /home/ec2-user/websocket_counter.sh << EOF',
      '#!/bin/bash',
      'HOSTNAME=$(hostname)',
      'while true; do',
      '  curl -s "$URL$HOSTNAME" > /dev/null',
      '  sleep $SLEEP',
      'done',
      'EOF',
      'chmod +x /home/ec2-user/websocket_counter.sh',
      'nohup /home/ec2-user/websocket_counter.sh > /dev/null 2>&1 &'
    );

    // Create the private instance
    const privateInstance = new ec2.Instance(this, 'PrivateInstance', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceName: 'private-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      // keyPair: keyPair,
      vpc: vpc,
      securityGroup: privateInstanceSecurityGroup,
      userData: privateInstanceUserData,
    });

    // Output the private instance's private IP
    new cdk.CfnOutput(this, 'PrivateInstancePrivateIP', {
      value: privateInstance.instancePrivateIp,
      description: 'Private IP of the private instance',
    });

    // Output the public NAT instance's public IP
    new cdk.CfnOutput(this, 'PublicNatInstancePublicIP', {
      value: publicNatInstance.instancePublicIp,
      description: 'Public IP of the public NAT instance',
    });

    // Output the public NAT instance's private IP
    new cdk.CfnOutput(this, 'PublicNatInstancePrivateIP', {
      value: publicNatInstance.instancePrivateIp,
      description: 'Private IP of the public NAT instance',
    });

    // // NACLs: Add SSH (22) rules for public subnet
    // new ec2.CfnNetworkAclEntry(this, 'PublicInboundSsh', {
    //   networkAclId: publicNatNACL.ref,
    //   ruleNumber: 400,
    //   protocol: 6, // TCP
    //   ruleAction: 'allow',
    //   egress: false,
    //   cidrBlock: '0.0.0.0/0',
    //   portRange: {
    //     from: 22,
    //     to: 22,
    //   },
    // });
    // new ec2.CfnNetworkAclEntry(this, 'PublicOutboundSsh', {
    //   networkAclId: publicNatNACL.ref,
    //   ruleNumber: 400,
    //   protocol: 6, // TCP
    //   ruleAction: 'allow',
    //   egress: true,
    //   cidrBlock: '0.0.0.0/0',
    //   portRange: {
    //     from: 22,
    //     to: 22,
    //   },
    // });
    // // NACLs: Add SSH (22) rules for private subnet
    // new ec2.CfnNetworkAclEntry(this, 'PrivateInboundSsh', {
    //   networkAclId: privateInstanceNACL.ref,
    //   ruleNumber: 400,
    //   protocol: 6, // TCP
    //   ruleAction: 'allow',
    //   egress: false,
    //   cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
    //   portRange: {
    //     from: 22,
    //     to: 22,
    //   },
    // });
    // new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundSsh', {
    //   networkAclId: privateInstanceNACL.ref,
    //   ruleNumber: 400,
    //   protocol: 6, // TCP
    //   ruleAction: 'allow',
    //   egress: true,
    //   cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
    //   portRange: {
    //     from: 22,
    //     to: 22,
    //   },
    // });
  }
}
